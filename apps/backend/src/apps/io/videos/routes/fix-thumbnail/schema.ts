import { z } from 'zod';
import { VideoDataSchema } from 'src/services/videos/convert/schema';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';

const FixThumbnailHandlerSchema = z.object({
  body: z.object({
    id: VideoDataSchema.shape.id,
  }),
  headers: taskHandlerHeaderSchema.passthrough(),
});

export type FixThumbnailHandlerRequest = z.infer<typeof FixThumbnailHandlerSchema>;
export { FixThumbnailHandlerSchema };
