import { Hono } from 'hono';
import { setThumbnailAtTimeSchema } from 'src/schema/videos/set-thumbnail-at-time';
import { setThumbnailUrlSchema } from 'src/schema/videos/set-thumbnail-url';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { setThumbnailAtTime } from '../videos/routes/set-thumbnail';
import { setThumbnailUrl } from '../videos/routes/set-thumbnail-url';

/**
 * User-facing video *Actions* (Hasura Actions, not Event triggers).
 *
 * These are authenticated by the caller's session (`x-hasura-user-id`), NOT by
 * the webhook signature the Event-trigger `videosRouter` enforces — so they live
 * on a separate router without `validateHasuraSignature`. Mirrors the storage
 * `createSignedUploadUrl` action.
 *
 * curl -X POST 'http://localhost:4000/videos-actions/set-thumbnail' \
 *   -H 'Content-Type: application/json' \
 *   -H 'x-hasura-action: setVideoThumbnailAtTime' \
 *   -d '{
 *     "action": { "name": "setVideoThumbnailAtTime" },
 *     "input": { "input": { "videoId": "550e8400-e29b-41d4-a716-446655440000", "atSeconds": 12.5 } },
 *     "session_variables": { "x-hasura-user-id": "550e8400-e29b-41d4-a716-446655440001" }
 *   }'
 *
 * `set-thumbnail` runs the server-side ffmpeg extraction (kept as a fallback).
 * `set-thumbnail-url` is the PRIMARY path: the client captures + uploads the
 * frame to GCS, then this action persists the resulting object as the thumbnail:
 *
 * curl -X POST 'http://localhost:4000/videos-actions/set-thumbnail-url' \
 *   -H 'Content-Type: application/json' \
 *   -H 'x-hasura-action: setVideoThumbnailUrl' \
 *   -d '{
 *     "action": { "name": "setVideoThumbnailUrl" },
 *     "input": { "input": { "videoId": "550e8400-e29b-41d4-a716-446655440000", "objectPath": "videos/550e8400-e29b-41d4-a716-446655440001/550e8400-e29b-41d4-a716-446655440000/abc.jpg" } },
 *     "session_variables": { "x-hasura-user-id": "550e8400-e29b-41d4-a716-446655440001" }
 *   }'
 */
const videoActionsRouter = new Hono();

videoActionsRouter.post(
  '/set-thumbnail',
  honoValidateRequest(setThumbnailAtTimeSchema),
  honoRequestHandler(setThumbnailAtTime),
);

videoActionsRouter.post(
  '/set-thumbnail-url',
  honoValidateRequest(setThumbnailUrlSchema),
  honoRequestHandler(setThumbnailUrl),
);

export { videoActionsRouter };
