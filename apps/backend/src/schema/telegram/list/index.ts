import { z } from 'zod';

// Validates the Hasura action payload for `listTelegramChannelVideos`. Args arrive
// under `input.input`; `userId` comes from the session, NEVER the request body —
// the Telegram MTProto session used to fetch history is always the caller's own.
const listTelegramChannelVideosSchema = z
  .object({
    body: z.object({
      action: z.object({ name: z.string() }),
      input: z.object({
        input: z.object({
          channelId: z.string().min(1),
          cursor: z.string().optional(),
        }),
      }),
      session_variables: z.looseObject({ 'x-hasura-user-id': z.guid() }),
    }),
  })
  .transform((req) => ({
    channelId: req.body.input.input.channelId,
    cursor: req.body.input.input.cursor,
    userId: req.body.session_variables['x-hasura-user-id'],
  }));

type ListTelegramChannelVideosRequest = z.infer<
  typeof listTelegramChannelVideosSchema
>;

// Mirrors `TelegramVideoMessage` in sworld-hasura-v2's actions.graphql (SWO-493).
interface TelegramVideoMessage {
  id: string;
  filename?: string;
  caption?: string;
  date: string;
  sizeBytes?: number;
  durationSeconds?: number;
  thumbnailDataUri?: string;
}

interface ListTelegramChannelVideosOutput {
  videos: TelegramVideoMessage[];
  nextCursor?: string;
}

export {
  listTelegramChannelVideosSchema,
  type ListTelegramChannelVideosRequest,
  type TelegramVideoMessage,
  type ListTelegramChannelVideosOutput,
};
