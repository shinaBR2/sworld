import { Hono } from 'hono';
import { setThumbnailAtTimeSchema } from 'src/schema/videos/set-thumbnail-at-time';
import { repairFmp4Schema } from 'src/schema/videos/repair-fmp4';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { setThumbnailAtTime } from '../videos/routes/set-thumbnail';
import { repairFmp4 } from '../videos/routes/repair-fmp4';

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
 * The PRIMARY path is now a plain Hasura `update_videos_by_pk` mutation: the
 * client captures + uploads the frame to GCS and updates `thumbnail_url`
 * directly, so no action is involved.
 */
const videoActionsRouter = new Hono();

videoActionsRouter.post(
  '/set-thumbnail',
  honoValidateRequest(setThumbnailAtTimeSchema),
  honoRequestHandler(setThumbnailAtTime),
);

videoActionsRouter.post(
  '/repair-fmp4',
  honoValidateRequest(repairFmp4Schema),
  honoRequestHandler(repairFmp4),
);

export { videoActionsRouter };
