import { z } from 'zod';
import { hasuraEventMetadataSchema, headersSchema, transformEventMetadata, transformHeaders } from '../../schema';

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

const CrawlSchema = z
  .object({
    body: z.object({
      event: CrawlEventSchema,
    }),
    headers: headersSchema,
  })
  .transform(req => ({
    ...transformHeaders(req),
    event: transformEvent(req.body.event),
  }));

export { CrawlEventSchema, CrawlRequestSchema, CrawlSchema };
export type CrawlRequest = z.infer<typeof CrawlSchema>;
