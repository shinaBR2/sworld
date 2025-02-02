import { z } from 'zod';
import {
  EventMetadataSchema,
  VideoDataSchema,
} from 'src/services/videos/convert/schema';

const StreamHandlerSchema = z.object({
  body: z.object({
    data: z.object({
      id: VideoDataSchema.shape.id,
      userId: VideoDataSchema.shape.user_id,
      videoUrl: VideoDataSchema.shape.video_url,
    }),
    metadata: z.object({
      id: EventMetadataSchema.shape.id,
      spanId: EventMetadataSchema.shape.span_id,
      traceId: EventMetadataSchema.shape.trace_id,
    }),
  }),
});

export type StreamHandlerRequest = z.infer<typeof StreamHandlerSchema>;
export { StreamHandlerSchema };
