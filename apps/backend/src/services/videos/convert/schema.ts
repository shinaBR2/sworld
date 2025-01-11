import { z } from 'zod';

const VideoDataSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  video_url: z.string().url(),
});
const EventMetadaSchema = z.object({
  id: z.string(),
  span_id: z.string(),
  trace_id: z.string(),
});
const EventSchema = z.object({
  metadata: EventMetadaSchema,
  data: VideoDataSchema,
});

const ConvertSchema = z
  .object({
    body: z.object({
      event: EventSchema,
    }),
    headers: z
      .object({
        'content-type': z.string(),
        'x-webhook-signature': z.string(),
      })
      .passthrough(), // Allow additional headers
  })
  .transform(req => ({
    event: {
      data: req.body.event.data,
      metadata: {
        spanId: req.body.event.metadata.span_id,
        traceId: req.body.event.metadata.trace_id,
      },
    },
    contentTypeHeader: req.headers['content-type'] as string,
    signatureHeader: req.headers['x-webhook-signature'] as string,
  }));

export { ConvertSchema };
