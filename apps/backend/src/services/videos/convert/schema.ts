import { z } from 'zod';

const VideoDataSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  video_url: z
    .string()
    .url()
    .regex(/^https:\/\//i, 'URL must use HTTPS')
    .refine(url => {
      const videoExtensions = ['.mp4'];
      return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    }, 'URL must point to a video file'),
});
const EventMetadataSchema = z.object({
  id: z.string(),
  span_id: z.string(),
  trace_id: z.string(),
});
const EventSchema = z.object({
  metadata: EventMetadataSchema,
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
        id: req.body.event.metadata.id,
        spanId: req.body.event.metadata.span_id,
        traceId: req.body.event.metadata.trace_id,
      },
    },
    contentTypeHeader: req.headers['content-type'] as string,
    signatureHeader: req.headers['x-webhook-signature'] as string,
  }));

export { ConvertSchema };
