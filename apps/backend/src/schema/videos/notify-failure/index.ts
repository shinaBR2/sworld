import { z } from 'zod';
import { hasuraEventMetadataSchema } from '../../hasura';

/**
 * The operator-safe failure record written by B1 (`markVideoFailed` /
 * `buildLastError`). Pinned here so the Hasura trigger payload and this
 * validator cannot drift from what B1 produces.
 */
const lastErrorSchema = z.object({
  code: z.string(),
  httpStatus: z.number().optional(),
  message: z.string(),
  at: z.string(),
});

const videoFailureMetadataSchema = z.looseObject({
  lastError: lastErrorSchema.optional(),
});

/**
 * The `videos` row delivered by the `status -> failed` event trigger (B2a).
 * The trigger fires on any `status` column change, so `status` is included and
 * the handler filters on it.
 */
const videoFailureDataSchema = z.object({
  id: z.guid(),
  title: z.string(),
  status: z.string(),
  metadata: videoFailureMetadataSchema.nullable().optional(),
});

const eventSchema = z.object({
  metadata: hasuraEventMetadataSchema,
  data: videoFailureDataSchema,
});

const notifyFailureSchema = z
  .object({
    body: z.object({
      event: eventSchema,
    }),
    headers: z.looseObject({
      'content-type': z.string(),
      'x-webhook-signature': z.string(),
    }),
  })
  .transform((req) => ({
    event: req.body.event,
    contentTypeHeader: req.headers['content-type'] as string,
    signatureHeader: req.headers['x-webhook-signature'] as string,
  }));

export {
  lastErrorSchema,
  videoFailureDataSchema,
  eventSchema,
  notifyFailureSchema,
};

export type NotifyFailureRequest = z.infer<typeof notifyFailureSchema>;
