import { z } from 'zod';

// Validates the Hasura action payload for `importTelegramArchive`. `userId` comes
// from the session, never the request body — same rule as `setThumbnailAtTime`.
const importTelegramArchiveSchema = z
  .object({
    body: z.object({
      action: z.object({ name: z.string() }),
      input: z.object({
        input: z.object({
          channelId: z.string().min(1),
          messageIds: z.array(z.string().min(1)).min(1),
        }),
      }),
      session_variables: z.looseObject({ 'x-hasura-user-id': z.guid() }),
    }),
  })
  .transform((req) => ({
    channelId: req.body.input.input.channelId,
    messageIds: req.body.input.input.messageIds,
    userId: req.body.session_variables['x-hasura-user-id'],
  }));

type ImportTelegramArchiveRequest = z.infer<typeof importTelegramArchiveSchema>;

interface ImportTelegramArchiveOutput {
  taskId: string;
}

export {
  importTelegramArchiveSchema,
  type ImportTelegramArchiveRequest,
  type ImportTelegramArchiveOutput,
};
