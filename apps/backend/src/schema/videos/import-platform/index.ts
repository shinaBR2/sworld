import { hasuraEventMetadataSchema } from 'src/schema/hasura';
import { videoDataSchema } from 'src/schema/videos/convert';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { z } from 'zod';

const importHandlerSchema = z.object({
  body: z.object({
    data: z.object({
      id: videoDataSchema.shape.id,
      userId: videoDataSchema.shape.user_id,
      videoUrl: videoDataSchema.shape.video_url,
    }),
    metadata: z.object({
      id: hasuraEventMetadataSchema.shape.id,
      spanId: hasuraEventMetadataSchema.shape.span_id,
      traceId: hasuraEventMetadataSchema.shape.trace_id,
    }),
  }),
  headers: taskHandlerHeaderSchema.passthrough(),
});

export type ImportHandlerRequest = z.infer<typeof importHandlerSchema>;
export { importHandlerSchema };
