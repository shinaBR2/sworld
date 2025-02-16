import { z } from 'zod';

const headersSchema = z.object({
  'content-type': z.string(),
  'x-webhook-signature': z.string(),
});
const schema = {
  headers: headersSchema.passthrough(),
};
const transformer = (req: any) => ({
  contentTypeHeader: req.headers['content-type'] as string,
  signatureHeader: req.headers['x-webhook-signature'] as string,
});

const webhookSchema = z.object(schema).transform(transformer);

export type WebhookRequest = z.infer<typeof webhookSchema>;
export { webhookSchema };
