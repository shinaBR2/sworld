import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { z } from 'zod';

const repairFmp4HandlerSchema = z.object({
  body: z.object({
    data: z.object({
      videoId: z.guid(),
      userId: z.guid(),
    }),
    metadata: z.object({
      id: z.string(),
      spanId: z.string(),
      traceId: z.string(),
    }),
  }),
  headers: z.looseObject(taskHandlerHeaderSchema.shape),
});

export type RepairFmp4HandlerRequest = z.infer<typeof repairFmp4HandlerSchema>;
export { repairFmp4HandlerSchema };
