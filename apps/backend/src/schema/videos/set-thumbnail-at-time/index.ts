import { z } from 'zod';

// Validates the Hasura action payload for `setVideoThumbnailAtTime`. Args arrive
// under `input.input` (the action's GraphQL arg is named `input`); `userId` comes
// from the session, NEVER the request body — ownership is enforced against it.
const setThumbnailAtTimeSchema = z
  .object({
    body: z.object({
      action: z.object({ name: z.string() }),
      input: z.object({
        input: z.object({
          videoId: z.string().uuid(),
          atSeconds: z.number().min(0),
        }),
      }),
      session_variables: z
        .object({ 'x-hasura-user-id': z.string().uuid() })
        .passthrough(),
    }),
  })
  .transform((req) => ({
    videoId: req.body.input.input.videoId,
    atSeconds: req.body.input.input.atSeconds,
    userId: req.body.session_variables['x-hasura-user-id'],
  }));

type SetThumbnailAtTimeRequest = z.infer<typeof setThumbnailAtTimeSchema>;

export { setThumbnailAtTimeSchema, type SetThumbnailAtTimeRequest };
