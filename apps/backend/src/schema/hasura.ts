import { z } from 'zod';

const hasuraHeadersSchema = z.object({
  'content-type': z.string(),
  'x-webhook-signature': z.string(),
});
const schema = {
  headers: hasuraHeadersSchema.passthrough(),
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

const hasuraWebhookSchema = z.object(schema).transform(transformHeaders);

type HasuraHeadersSchema = z.infer<typeof hasuraHeadersSchema>;
type HasuraEventMetadataSchema = z.infer<typeof hasuraEventMetadataSchema>;

type HasuraWebhookRequest = z.infer<typeof hasuraWebhookSchema>;
export {
  hasuraEventMetadataSchema,
  type HasuraHeadersSchema,
  type HasuraEventMetadataSchema,
  type HasuraWebhookRequest,
  hasuraHeadersSchema,
  transformEventMetadata,
  transformHeaders,
  hasuraWebhookSchema,
};
