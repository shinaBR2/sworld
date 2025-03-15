import { z } from 'zod';

const headersSchema = z.object({
  'content-type': z.string(),
  'x-webhook-signature': z.string(),
});
const schema = {
  headers: headersSchema.passthrough(),
};
const transformHeaders = (req: any) => ({
  contentTypeHeader: req.headers['content-type'] as string,
  signatureHeader: req.headers['x-webhook-signature'] as string,
});

const hasuraEventMetadataSchema = z.object({
  id: z.string(),
  span_id: z.string(),
  trace_id: z.string(),
});

const transformEventMetadata = (metadata: any) => ({
  id: metadata.id,
  spanId: metadata.span_id,
  traceId: metadata.trace_id,
});

const webhookSchema = z.object(schema).transform(transformHeaders);

export type WebhookRequest = z.infer<typeof webhookSchema>;
export { hasuraEventMetadataSchema, headersSchema, transformEventMetadata, transformHeaders, webhookSchema };
