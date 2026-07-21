import { zValidator as zv } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { z } from 'zod';

// zod 4 dropped the `received` field from invalid_type issues and rephrased
// the default message ("Invalid input: expected string, received number").
// Recover expected/received from that message so the user-facing text keeps
// the zod 3 era wording ("x is required", "x: Expected string, received
// number") instead of leaking the raw zod 4 phrasing.
const INVALID_TYPE_MESSAGE = /^Invalid input: expected (.+), received (.+)$/;

const formatZodError = (error: z.core.$ZodError): string => {
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

/**
 * This damn schema ONLY for request body
 * We CAN'T validate headers or query params
 */
const zodValidator = <
  T extends z.ZodType,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  zv(target, schema, (result, c) => {
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
