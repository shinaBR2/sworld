import type { SignedUploadUrlRequest } from 'src/schema/storage/signed-upload-url';
import { getSignedUploadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';
import { resolveObjectPath } from './matrix';

/**
 * Mint a V4 signed PUT URL for a direct browser→GCS upload. Dead simple: resolve
 * the normalized object path from the (site, action) matrix + session user, sign
 * it, and return the URL. No DB reads/writes.
 */
const createSignedUploadUrl = async (
  context: HandlerContext<SignedUploadUrlRequest>,
) => {
  const { site, action, id, contentType, userId } = context.validatedData;

  let objectPath: string;
  try {
    objectPath = resolveObjectPath({ site, action, contentType, userId, id });
  } catch (error) {
    // Known-but-invalid (site, action) pair or a disallowed content type — a
    // client error, surfaced via the action's success/error response shape.
    return AppError((error as Error).message);
  }

  const { uploadUrl, publicUrl, expiresAt } = await getSignedUploadUrl({
    objectPath,
    contentType,
  });

  return AppResponse(true, 'ok', {
    uploadUrl,
    publicUrl,
    objectPath,
    expiresAt,
  });
};

export { createSignedUploadUrl };
