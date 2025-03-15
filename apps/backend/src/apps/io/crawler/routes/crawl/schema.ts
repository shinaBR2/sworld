import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { z } from 'zod';

export const crawlHandlerSchema = z.object({
  headers: taskHandlerHeaderSchema.passthrough(),
  body: z.object({
    getSingleVideo: z.boolean(),
    url: z.string().url(),
    title: z.string().min(1),
    slugPrefix: z.string().optional().default(''),
    userId: z.string().uuid(),
  }),
});

export type CrawlHandlerInput = z.infer<typeof crawlHandlerSchema>;
