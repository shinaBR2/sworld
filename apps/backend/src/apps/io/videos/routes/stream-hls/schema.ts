import { EventMetadataSchema, VideoDataSchema } from 'src/services/videos/convert/schema';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { z } from 'zod';

const StreamHandlerSchema = z.object({
  body: z.object({
    data: z.object({
      id: VideoDataSchema.shape.id,
      userId: VideoDataSchema.shape.user_id,
      videoUrl: VideoDataSchema.shape.video_url,
      keepOriginalSource: VideoDataSchema.shape.keep_original_source,
    }),
    metadata: z.object({
      id: EventMetadataSchema.shape.id,
      spanId: EventMetadataSchema.shape.span_id,
      traceId: EventMetadataSchema.shape.trace_id,
    }),
  }),
  headers: taskHandlerHeaderSchema.passthrough(),
});

export type StreamHandlerRequest = z.infer<typeof StreamHandlerSchema>;
export { StreamHandlerSchema };
