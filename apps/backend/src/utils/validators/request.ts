import type { Context, Next } from 'hono';
import type { ZodError, z } from 'zod';
import { getClientIP } from '../ip';
import { getCurrentLogger } from '../logger';
import type { ServiceResponse } from '../schema';

// Framework-agnostic validation context
interface ValidationContext {
  params: Record<string, string>;
  query: Record<string, any>;
  body: any;
  headers: Record<string, string>;
  ip: string;
  userAgent?: string;
}

// Framework-agnostic validation result
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pure validation logic (framework-independent)
const validateData = <T>(
  schema: z.ZodType<T>,
  context: ValidationContext,
): ValidationResult<T> => {
  try {
    const validated = schema.parse(context);
    return {
      success: true,
      data: validated,
    };
  } catch (err) {
    const errorMessage = `Invalid input: ${formatZodError(err as ZodError)}`;
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// zod 4 dropped the `received` field from invalid_type issues and rephrased
// the default message ("Invalid input: expected string, received number").
// Recover expected/received from that message so the user-facing text keeps
// the zod 3 era wording ("x is required", "x: Expected string, received
// number") instead of leaking the raw zod 4 phrasing.
const INVALID_TYPE_MESSAGE = /^Invalid input: expected (.+), received (.+)$/;

const formatZodError = (error: ZodError): string => {
  return error.issues
    .map((issue) => {
      const path = issue.path
        .map((p) => {
          if (p === 'headers') return 'Header';
          if (typeof p === 'number') return `[${p}]`;
          return String(p);
        })
        .join(' ');

      const invalidType =
        issue.code === 'invalid_type'
          ? issue.message.match(INVALID_TYPE_MESSAGE)
          : null;
      if (invalidType) {
        const [, expected, received] = invalidType;
        if (received === 'undefined') {
          return `${path} is required`;
        }
        return `${path}: Expected ${expected}, received ${received}`;
      }

      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(', ');
};

// Keys whose values are secrets and must never reach the logs. The validated
// payload is logged for debugging (see below); a login `code` is a live Telegram
// OTP and `sessionString`/`apiHash` are password-equivalent, so they are masked
// in the logged copy only — the real `validatedData` handed to the handler is
// untouched. Matched case-insensitively so `code`, `sessionString`, `api_hash`
// etc. are all covered.
const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'code',
  'phonecodehash',
  'phone_code_hash',
  'sessionstring',
  'session_string',
  'pendingsessionstring',
  'pending_session_string',
  'apihash',
  'api_hash',
  'apikey',
  'api_key',
  'password',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
]);

// Deep-clone `value`, replacing any secret-keyed field with a redaction marker.
// Used only to build the copy that gets logged — never mutates the input.
const redactSensitive = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) =>
        SENSITIVE_KEYS.has(key.toLowerCase())
          ? [key, '[REDACTED]']
          : [key, redactSensitive(val)],
      ),
    );
  }
  return value;
};

// Hono wrapper
const honoValidateRequest = <T>(schema: z.ZodType<T>) => {
  return async (c: Context, next: Next) => {
    try {
      const logger = getCurrentLogger();
      const body = await c.req.json().catch(() => ({}));
      const query = Object.fromEntries(new URL(c.req.url).searchParams);
      const params = c.req.param();
      const headers = Object.fromEntries(c.req.raw.headers);

      const context: ValidationContext = {
        params,
        query,
        body,
        headers,
        ip: getClientIP(headers),
        userAgent: headers['user-agent'],
      };

      const result = validateData(schema, context);

      logger.info({
        message: 'Validation result',
        result: redactSensitive(result),
      });

      if (result.success) {
        c.set('validatedData', result.data);
        await next();
      } else {
        // 400, not 200: a 2xx made Cloud Tasks treat a rejected task as
        // delivered (no retry / dead-letter) without ever reaching the handler,
        // so a payload-shape mismatch silently stalled the whole pipeline.
        // Failing loud lets Cloud Tasks / Hasura surface it. See D1.
        const serviceResponse: ServiceResponse<null> = {
          success: false,
          message: result.error ?? '',
          dataObject: null,
        };
        return c.json(serviceResponse, 400);
      }
    } catch (_err) {
      const serviceResponse: ServiceResponse<null> = {
        success: false,
        message: 'Failed to parse request',
        dataObject: null,
      };
      return c.json(serviceResponse, 400);
    }
  };
};

type ValidatedContext<T extends z.ZodType> = Context & {
  validatedData: z.infer<T>;
};

export {
  honoValidateRequest,
  validateData, // Pure function for testing
  type ValidationContext,
  type ValidationResult,
  type ValidatedContext,
};
