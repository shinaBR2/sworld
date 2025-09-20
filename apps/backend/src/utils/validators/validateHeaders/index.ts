import type { Context, Next } from 'hono';
import type { z } from 'zod';

export const validateHeaders = (headerSchema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    const headers = Object.fromEntries(c.req.raw.headers);
    const result = headerSchema.safeParse(headers);

    if (!result.success) {
      return c.json({
        success: false,
        message: 'Invalid headers',
        errors: result.error.format(),
      });
    }

    await next();
  };
};
