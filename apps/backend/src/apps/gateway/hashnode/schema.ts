import { z } from 'zod';

const headersSchema = z.object({
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

const bodySchema = z.object({
  metadata: metadataSchema,
  data: dataSchema,
});

const schema = {
  headers: headersSchema.passthrough(),
  body: bodySchema,
};

const transformHeaders = (req: any) => ({
  contentTypeHeader: req.headers['content-type'] as string,
  signatureHeader: req.headers['x-hashnode-signature'] as string,
  body: req.body,
});

const webhookSchema = z.object(schema).transform(transformHeaders);

export type WebhookRequest = z.infer<typeof webhookSchema>;
export { webhookSchema };
