import { z } from "zod";

const VideoDataSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  video_url: z.string().url(),
});
const EventTraceContextSchema = z.object({
  span_id: z.string(),
  trace_id: z.string(),
});

const ConvertSchema = z
  .object({
    body: z.object({
      id: z.string(),
      event: VideoDataSchema,
      event_trace_context: EventTraceContextSchema,
    }),
    headers: z
      .object({
        "content-type": z.string(),
        "x-webhook-signature": z.string(),
      })
      .passthrough(), // Allow additional headers
  })
  .transform((req) => ({
    data: req.body.event,
    metadata: {
      id: req.body.id,
      traceContext: req.body.event_trace_context,
    },
    contentTypeHeader: req.headers["content-type"] as string,
    signatureHeader: req.headers["x-webhook-signature"] as string,
  }));

export { ConvertSchema };
