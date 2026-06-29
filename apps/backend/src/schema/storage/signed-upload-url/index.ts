import { z } from 'zod';

// Known sites/actions. The (site, action) *pair* is validated against the
// upload matrix in the handler — this enum only gates inputs to known values.
const UPLOAD_SITES = ['watch', 'listen', 'main'] as const;
const UPLOAD_ACTIONS = [
  'VIDEO_UPLOAD',
  'VIDEO_THUMBNAIL_UPLOAD',
  'PLAYLIST_THUMBNAIL_UPLOAD',
  'AUDIO_UPLOAD',
  'BOOK_UPLOAD',
] as const;

// Validates the Hasura action payload. Args arrive under `input.input` (the
// action's GraphQL arg is named `input`); `userId` comes from the session, not
// the request body.
const signedUploadUrlSchema = z
  .object({
    body: z.object({
      action: z.object({ name: z.string() }),
      input: z.object({
        input: z.object({
          site: z.enum(UPLOAD_SITES),
          action: z.enum(UPLOAD_ACTIONS),
          id: z.string().uuid().optional(),
          contentType: z.string().min(1),
        }),
      }),
      session_variables: z
        .object({ 'x-hasura-user-id': z.string().uuid() })
        .passthrough(),
    }),
  })
  .transform((req) => ({
    site: req.body.input.input.site,
    action: req.body.input.input.action,
    id: req.body.input.input.id,
    contentType: req.body.input.input.contentType,
    userId: req.body.session_variables['x-hasura-user-id'],
  }));

type SignedUploadUrlRequest = z.infer<typeof signedUploadUrlSchema>;

export {
  UPLOAD_SITES,
  UPLOAD_ACTIONS,
  signedUploadUrlSchema,
  type SignedUploadUrlRequest,
};
