import type { SetThumbnailAtTimeRequest } from 'src/schema/videos/set-thumbnail-at-time';
import { setVideoThumbnail } from 'src/services/hasura/mutations/videos/setThumbnail';
import { getVideoById } from 'src/services/hasura/queries/videos';
import { extractThumbnailAtTime } from 'src/services/videos/helpers/thumbnail/extractAtTime';
import { CustomError } from 'src/utils/custom-error';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';

/**
 * `setVideoThumbnailAtTime` action: extract the frame at `atSeconds` from the
 * video's stored HLS and persist it as the video's thumbnail.
 *
 * Ownership is enforced against the SESSION user id: the caller must own the
 * video or the request is rejected before any extraction or write happens.
 */
const setThumbnailAtTime = async (
  context: HandlerContext<SetThumbnailAtTimeRequest>,
) => {
  const logger = getCurrentLogger();
  const { videoId, atSeconds, userId } = context.validatedData;

  const video = await getVideoById(videoId);

  if (!video) {
    return AppError(`Video with ID ${videoId} not found`);
  }

  if (video.user_id !== userId) {
    logger.warn(
      { videoId, userId, ownerId: video.user_id },
      '[setThumbnailAtTime] ownership check failed',
    );
    return AppError('You do not have permission to modify this video');
  }

  if (!video.source) {
    return AppError(`Video with ID ${videoId} has no stored source`);
  }

  try {
    const thumbnailUrl = await extractThumbnailAtTime({
      source: video.source,
      atSeconds,
      userId,
      videoId,
      duration: video.duration ?? undefined,
    });

    await setVideoThumbnail({ id: videoId, thumbnailUrl });

    return AppResponse(true, 'ok', { thumbnailUrl });
  } catch (error) {
    logger.error({ error, videoId, atSeconds }, '[setThumbnailAtTime] failed');
    const message =
      error instanceof CustomError || error instanceof Error
        ? error.message
        : 'Failed to set video thumbnail';
    return AppError(message);
  }
};

export { setThumbnailAtTime };
