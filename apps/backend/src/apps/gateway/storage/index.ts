import { Hono } from 'hono';
import { signedUploadUrlSchema } from 'src/schema/storage/signed-upload-url';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { createSignedUploadUrl } from './routes/signed-upload-url';

const storageRouter = new Hono();

/**
 * App-agnostic GCS signed-upload-URL action. Mirrors the `auth/device` action:
 * Hasura `createSignedUploadUrl` → request_transform → POST here.
 *
 * curl -X POST 'http://localhost:4000/storage/signed-upload-url' \
 *   -H 'Content-Type: application/json' \
 *   -H 'x-hasura-action: createSignedUploadUrl' \
 *   -d '{
 *     "action": { "name": "createSignedUploadUrl" },
 *     "input": { "input": { "site": "watch", "action": "VIDEO_THUMBNAIL_UPLOAD", "id": "550e8400-e29b-41d4-a716-446655440000", "contentType": "image/png" } },
 *     "session_variables": { "x-hasura-user-id": "550e8400-e29b-41d4-a716-446655440001" }
 *   }'
 */
storageRouter.post(
  '/signed-upload-url',
  honoValidateRequest(signedUploadUrlSchema),
  honoRequestHandler(createSignedUploadUrl),
);

export { storageRouter };
