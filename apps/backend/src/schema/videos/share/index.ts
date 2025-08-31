import { hasuraEventMetadataSchema } from 'src/schema/hasura';
import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { z } from 'zod';
import { videoDataSchema } from '../convert';

/**
 * Receive event from hasura
 * - get input from playlist edit
 * - Loop through all emails, check email is valid
 * - if email is valid, fetch all videos in playlist,
 * create shared_video_recipients record for each video in playlist
 * - Update shared_recipients in playlist
 */

/**
 * These schemas from hasura, for gateway
 */
const playlistSchema = z.object({
  id: z.string().uuid(),
  shared_recipients_input: z
    .array(z.string().email())
    .min(1, 'At least one recipient is required'),
});

const eventSchema = z.object({
  metadata: hasuraEventMetadataSchema,
  data: playlistSchema,
});

const originalShareSchema = z.object({
  body: z.object({
    event: eventSchema,
  }),
  headers: z
    .object({
      'content-type': z.string(),
      'x-webhook-signature': z.string(),
    })
    .passthrough(),
});

const transformEvent = (event: z.infer<typeof eventSchema>) => {
  return {
    data: {
      id: event.data.id,
      sharedRecipientsInput: event.data.shared_recipients_input,
    },
    metadata: {
      id: event.metadata.id,
      spanId: event.metadata.span_id,
      traceId: event.metadata.trace_id,
    },
  };
};

const shareSchema = originalShareSchema.transform((req) => ({
  event: transformEvent(req.body.event),
  contentTypeHeader: req.headers['content-type'] as string,
  signatureHeader: req.headers['x-webhook-signature'] as string,
}));

export type ShareRequest = z.infer<typeof shareSchema>;
export { shareSchema };
