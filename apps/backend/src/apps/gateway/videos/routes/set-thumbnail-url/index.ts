import type { SetThumbnailUrlRequest } from 'src/schema/videos/set-thumbnail-url';
import { setVideoThumbnail } from 'src/services/hasura/mutations/videos/setThumbnail';
import { getVideoById } from 'src/services/hasura/queries/videos';
import { getDownloadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';

/**
 * `setVideoThumbnailUrl` action: persist a thumbnail the CLIENT already captured
 * and uploaded. This is the PRIMARY thumbnail path — the browser grabs the paused
 * frame, downscales it, and uploads it to GCS via a `createSignedUploadUrl` signed
 * URL; this action only records the resulting object as the video's thumbnail. The
 * server-side `setVideoThumbnailAtTime` (ffmpeg extraction) is kept as a fallback.
 *
 * Two independent guards, both against the SESSION user id (never the request body):
 *  - Ownership: the caller must own the video.
 *  - Path safety: `objectPath` MUST live under `videos/{userId}/{videoId}/`. The
 *    signed-upload matrix always writes thumbnails there, so anything outside that
 *    prefix is a caller pointing us at someone else's object — reject it, otherwise
 *    a user could set their video's thumbnail to an arbitrary GCS path.
 */
const setThumbnailUrl = async (
  context: HandlerContext<SetThumbnailUrlRequest>,
) => {
  const logger = getCurrentLogger();
  const { videoId, objectPath, userId } = context.validatedData;

  const video = await getVideoById(videoId);

  if (!video) {
    return AppError(`Video with ID ${videoId} not found`);
  }

  if (video.user_id !== userId) {
    logger.warn(
      { videoId, userId, ownerId: video.user_id },
      '[setThumbnailUrl] ownership check failed',
    );
    return AppError('You do not have permission to modify this video');
  }

  const expectedPrefix = `videos/${userId}/${videoId}/`;
  if (!objectPath.startsWith(expectedPrefix)) {
    logger.warn(
      { videoId, userId, objectPath },
      '[setThumbnailUrl] object path outside the allowed prefix',
    );
    return AppError('Invalid thumbnail path');
  }

  const thumbnailUrl = getDownloadUrl(objectPath);
  await setVideoThumbnail({ id: videoId, thumbnailUrl });

  return AppResponse(true, 'ok', { thumbnailUrl });
};

export { setThumbnailUrl };
