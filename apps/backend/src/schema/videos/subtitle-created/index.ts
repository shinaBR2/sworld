import { z } from 'zod';
import { hasuraEventMetadataSchema } from '../../hasura';

/**
 * Schema for subtitle data
 */
const subtitleDataSchema = z.object({
  id: z.guid(),
  videoId: z.guid(),
  userId: z.guid(),
  lang: z.string(),
  url: z.url(),
  isDefault: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
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

export { subtitleDataSchema, eventSchema, subtitleCreatedSchema };

export type SubtitleData = z.infer<typeof subtitleDataSchema>;
export type SubtitleCreatedRequest = z.infer<typeof subtitleCreatedSchema>;
