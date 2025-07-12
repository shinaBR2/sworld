import { z } from 'zod';
import { hasuraEventMetadataSchema } from '../../hasura';

/**
 * Schema for subtitle data
 */
const subtitleDataSchema = z.object({
  id: z.string().uuid(),
  videoId: z.string().uuid(),
  userId: z.string().uuid(),
  lang: z.string(),
  url: z.string().url(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Event schema for subtitle-created event
 */
const eventSchema = z.object({
  metadata: hasuraEventMetadataSchema,
  data: subtitleDataSchema,
});

/**
 * Main schema for the subtitle-created endpoint
 */
const subtitleCreatedSchema = z
  .object({
    body: z.object({
      event: eventSchema,
    }),
    headers: z
      .object({
        'content-type': z.string(),
        'x-webhook-signature': z.string(),
      })
      .passthrough(),
  })
  .transform(req => ({
    event: req.body.event,
    contentTypeHeader: req.headers['content-type'] as string,
    signatureHeader: req.headers['x-webhook-signature'] as string,
  }));

export { subtitleDataSchema, eventSchema, subtitleCreatedSchema };

export type SubtitleData = z.infer<typeof subtitleDataSchema>;
export type SubtitleCreatedRequest = z.infer<typeof subtitleCreatedSchema>;
