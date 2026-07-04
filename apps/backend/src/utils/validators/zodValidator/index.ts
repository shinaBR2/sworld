import { zValidator as zv } from '@hono/zod-validator';
import type { Context, MiddlewareHandler, ValidationTargets } from 'hono';
import type { ZodError, ZodSchema, z } from 'zod';

// TODO: upgrade zod to use its native formatter
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

type ZodValidatorHookResult<T extends ZodSchema> =
  | { success: true; data: z.output<T> }
  | { success: false; error: ZodError };

type ZodValidatorFn = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
  hook: (result: ZodValidatorHookResult<T>, c: Context) => Response | undefined,
) => MiddlewareHandler;

/**
 * This damn schema ONLY for request body
 * We CAN'T validate headers or query params
 */
const zodValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  (zv as unknown as ZodValidatorFn)(target, schema, (result, c) => {
    console.log(`result`, result);
    if (!result.success) {
      const message = formatZodError(result.error);

      // This return here is MUST!
      return c.json({
        success: false,
        message,
        dataObject: null,
      });
    }
    return undefined;
  });

export { zodValidator };
