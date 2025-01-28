import { z } from 'zod';

const videoUrlSchema = z
  .string()
  .url()
  .regex(/^https:\/\//i, 'URL must use HTTPS')
  .refine(url => {
    const videoExtensions = ['.mp4'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  }, 'URL must point to a video file');

const VideoDataSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  video_url: videoUrlSchema,
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

const transformEvent = (event: z.infer<typeof EventSchema>) => ({
  data: {
    id: event.data.id,
    userId: event.data.user_id,
    videoUrl: event.data.video_url,
  },
  metadata: {
    id: event.metadata.id,
    spanId: event.metadata.span_id,
    traceId: event.metadata.trace_id,
  },
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
      .passthrough(),
  })
  .transform(req => ({
    event: transformEvent(req.body.event),
    contentTypeHeader: req.headers['content-type'] as string,
    signatureHeader: req.headers['x-webhook-signature'] as string,
  }));

export { VideoDataSchema, EventMetadataSchema, EventSchema, ConvertSchema };
export type ConvertRequest = z.infer<typeof ConvertSchema>;
