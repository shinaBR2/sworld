import { EventMetadataSchema } from 'src/services/videos/convert/schema';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { z } from 'zod';

export const crawlHandlerSchema = z.object({
  headers: taskHandlerHeaderSchema.passthrough(),
  body: z.object({
    data: z.object({
      getSingleVideo: z.boolean(),
      url: z.string().url(),
      title: z.string().min(1),
      slugPrefix: z.string().optional().default(''),
      userId: z.string().uuid(),
    }),
    metadata: z.object({
      id: EventMetadataSchema.shape.id,
      spanId: EventMetadataSchema.shape.span_id,
      traceId: EventMetadataSchema.shape.trace_id,
    }),
  }),
});

export type CrawlHandlerInput = z.infer<typeof crawlHandlerSchema>;
