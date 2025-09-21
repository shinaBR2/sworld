import { videoDataSchema } from 'src/schema/videos/convert';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { z } from 'zod';

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
