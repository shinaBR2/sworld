import { z } from 'zod';
import { hasuraEventMetadataSchema } from '../../hasura';
import { validateMediaURL } from 'src/services/videos/convert/validator';
import { videoUrlSchema } from '../common';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';

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

const convertSchema = z
  .object({
    body: z.object({
      event: eventSchema,
    }),
    headers: z
      .object({
        'content-type': z.string(),
        'x-webhook-signature': z.string(),
      })
      .passthrough(),
  })
  .transform(req => ({
    event: transformEvent(req.body.event),
    contentTypeHeader: req.headers['content-type'] as string,
    signatureHeader: req.headers['x-webhook-signature'] as string,
  }));

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

export { convertSchema, eventSchema, videoDataSchema, convertHandlerSchema };
export type ConvertRequest = z.infer<typeof convertSchema>;
export type ConvertHandlerRequest = z.infer<typeof convertHandlerSchema>;
