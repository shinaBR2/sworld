import { z } from 'zod';
import {
  hasuraEventMetadataSchema,
  headersSchema,
  transformEventMetadata,
  transformHeaders,
} from 'src/schema/hasura';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';

const CrawlRequestSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  url: z.string().url(),
  get_single_video: z.boolean(),
  title: z.string().min(1),
  slug_prefix: z.string().optional(),
});

const CrawlEventSchema = z.object({
  metadata: hasuraEventMetadataSchema,
  data: CrawlRequestSchema,
});

const transformEvent = (event: z.infer<typeof CrawlEventSchema>) => {
  return {
    data: {
      id: event.data.id,
      userId: event.data.user_id,
      url: event.data.url,
      getSingleVideo: event.data.get_single_video,
      title: event.data.title,
      slugPrefix: event.data.slug_prefix,
    },
    metadata: {
      ...transformEventMetadata(event.metadata),
    },
  };
};

const crawlSchema = z
  .object({
    body: z.object({
      event: CrawlEventSchema,
    }),
    headers: headersSchema,
  })
  .transform((req) => ({
    ...transformHeaders(req),
    event: transformEvent(req.body.event),
  }));

const crawlHandlerSchema = z.object({
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
      id: hasuraEventMetadataSchema.shape.id,
      spanId: hasuraEventMetadataSchema.shape.span_id,
      traceId: hasuraEventMetadataSchema.shape.trace_id,
    }),
  }),
});

export {
  CrawlEventSchema,
  CrawlRequestSchema,
  crawlSchema,
  crawlHandlerSchema,
};
export type CrawlRequest = z.infer<typeof crawlSchema>;
export type CrawlHandlerRequest = z.infer<typeof crawlHandlerSchema>;
