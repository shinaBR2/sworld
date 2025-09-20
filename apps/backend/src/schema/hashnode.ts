import { z } from 'zod';

const hashnodeHeadersSchema = z.object({
  'content-type': z.literal('application/json'),
  'x-hashnode-signature': z.string(),
});

const metadataSchema = z.object({
  uuid: z.string().uuid(),
});

const publicationSchema = z.object({
  id: z.string(),
});

const postSchema = z.object({
  id: z.string(),
});

const dataSchema = z.object({
  publication: publicationSchema,
  post: postSchema,
  eventType: z.enum(['post_published', 'post_updated', 'post_deleted']),
});

const hashnodeBodySchema = z.object({
  metadata: metadataSchema,
  data: dataSchema,
});

export type HashnodeBodySchema = z.infer<typeof hashnodeBodySchema>;

export { hashnodeHeadersSchema, hashnodeBodySchema };
