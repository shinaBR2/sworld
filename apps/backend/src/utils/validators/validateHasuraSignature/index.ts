import type { Context, Next } from 'hono';
import { getCurrentLogger } from 'src/utils/logger';
import { AppError } from 'src/utils/schema';
import { validateSignature } from './validator';

export const validateHasuraSignature = () => {
  return async (c: Context, next: Next) => {
    const logger = getCurrentLogger();

    const signatureHeader = c.req.header('x-webhook-signature');
    const body = await c.req.raw.clone().text();
    const eventId = JSON.parse(body)?.event?.metadata?.id;

    if (!signatureHeader) {
      return c.json(
        AppError('Missing signature header', {
          eventId,
        }),
      );
    }

    const valid = validateSignature(signatureHeader);

    if (!valid) {
      logger.info({
        message: 'Invalid Hasura webhook signature',
        eventId,
      });
      return c.json(
        AppError('Invalid webhook signature', {
          eventId,
        }),
      );
    }

    await next();
  };
};
