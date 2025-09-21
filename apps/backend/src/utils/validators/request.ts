import type { Context, Next } from 'hono';
import type { ZodError, ZodSchema, z } from 'zod';
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
  schema: ZodSchema<T, any, any>,
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

const formatZodError = (error: ZodError): string => {
  return error.errors
    .map((err) => {
      const path = err.path
        .map((p) => {
          if (p === 'headers') return 'Header';
          if (typeof p === 'string') return p;
          return `[${p}]`;
        })
        .join(' ');

      if (err.message === 'Required') {
        return `${path} is required`;
      }

      return path ? `${path}: ${err.message}` : err.message;
    })
    .join(', ');
};

// Hono wrapper
const honoValidateRequest = <T>(schema: ZodSchema<T, any, any>) => {
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
        result,
      });

      if (result.success) {
        c.set('validatedData', result.data);
        await next();
      } else {
        const serviceResponse: ServiceResponse<null> = {
          success: false,
          message: result.error ?? '',
          dataObject: null,
        };
        return c.json(serviceResponse, 200);
      }
    } catch (_err) {
      const serviceResponse: ServiceResponse<null> = {
        success: false,
        message: 'Failed to parse request',
        dataObject: null,
      };
      return c.json(serviceResponse, 200);
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
