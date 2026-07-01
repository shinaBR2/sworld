import { z } from 'zod';

// Validates the Hasura action payload for `setVideoThumbnailUrl` — the persist
// step of the client-side thumbnail-capture flow. The browser has already
// captured, downscaled and uploaded the frame to GCS via a signed URL; this
// action only records the resulting `objectPath`. Args arrive under
// `input.input` (the action's GraphQL arg is named `input`); `userId` comes from
// the session, NEVER the request body — ownership + path safety enforce against it.
const setThumbnailUrlSchema = z
  .object({
    body: z.object({
      action: z.object({ name: z.string() }),
      input: z.object({
        input: z.object({
          videoId: z.string().uuid(),
          objectPath: z.string().min(1),
        }),
      }),
      session_variables: z
        .object({ 'x-hasura-user-id': z.string().uuid() })
        .passthrough(),
    }),
  })
  .transform((req) => ({
    videoId: req.body.input.input.videoId,
    objectPath: req.body.input.input.objectPath,
    userId: req.body.session_variables['x-hasura-user-id'],
  }));

type SetThumbnailUrlRequest = z.infer<typeof setThumbnailUrlSchema>;

export { setThumbnailUrlSchema, type SetThumbnailUrlRequest };
