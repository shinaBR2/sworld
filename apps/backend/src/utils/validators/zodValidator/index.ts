import { zValidator as zv } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodError, ZodSchema } from 'zod';

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

const zodValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      const message = formatZodError(result.error);

      // This return here is MUST!
      return c.json({
        success: false,
        message,
        dataObject: null,
      });
    }
  });

export { zodValidator };
