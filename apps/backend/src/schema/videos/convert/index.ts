import { validateMediaURL } from 'src/services/videos/convert/validator';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { z } from 'zod';
import { hasuraEventMetadataSchema } from '../../hasura';
import { videoUrlSchema } from '../common';

/**
 * These schemas from hasura, for gateway
 */

const videoDataSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  video_url: videoUrlSchema,
  skip_process: z.boolean(),
  keep_original_source: z.boolean(),
});

const eventSchema = z.object({
  metadata: hasuraEventMetadataSchema,
  data: videoDataSchema,
});

const transformEvent = (event: z.infer<typeof eventSchema>) => {
  const mediaInfo = validateMediaURL(event.data.video_url);
  const { platform = null, fileType = null } = mediaInfo;

  return {
    data: {
      id: event.data.id,
      userId: event.data.user_id,
      videoUrl: event.data.video_url,
      skipProcess: event.data.skip_process,
      keepOriginalSource: event.data.keep_original_source,
      platform,
      fileType,
    },
    metadata: {
      id: event.metadata.id,
      spanId: event.metadata.span_id,
      traceId: event.metadata.trace_id,
    },
  };
};

const convertBodySchema = z.object({
  event: eventSchema,
});
type ConvertBodySchema = z.infer<typeof convertBodySchema>;

/**
 * These schemas for Cloud Task handler
 */
const convertHandlerSchema = z.object({
  body: z.object({
    data: z.object({
      id: videoDataSchema.shape.id,
      userId: videoDataSchema.shape.user_id,
      videoUrl: videoDataSchema.shape.video_url,
    }),
    metadata: z.object({
      id: hasuraEventMetadataSchema.shape.id, // Can we reuse somehow?
      spanId: hasuraEventMetadataSchema.shape.span_id,
      traceId: hasuraEventMetadataSchema.shape.trace_id,
    }),
  }),
  headers: taskHandlerHeaderSchema.passthrough(),
});

export {
  convertBodySchema,
  type ConvertBodySchema,
  transformEvent,
  videoDataSchema,
  convertHandlerSchema,
};
export type ConvertHandlerRequest = z.infer<typeof convertHandlerSchema>;
