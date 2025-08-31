import { z } from 'zod';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { videoDataSchema } from 'src/schema/videos/convert';

const fixDurationHandlerSchema = z.object({
  body: z.object({
    id: videoDataSchema.shape.id,
  }),
  headers: taskHandlerHeaderSchema.passthrough(),
});

export type FixDurationHandlerRequest = z.infer<
  typeof fixDurationHandlerSchema
>;
export { fixDurationHandlerSchema };
