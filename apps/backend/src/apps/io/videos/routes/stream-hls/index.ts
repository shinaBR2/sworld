import type { StreamHandlerRequest } from 'src/schema/videos/stream-hls';
import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { videoConfig } from 'src/services/videos/config';
import { streamM3U8 } from 'src/services/videos/helpers/m3u8';
import { CustomError } from 'src/utils/custom-error';
import { HTTP_ERRORS } from 'src/utils/error-codes';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';

const streamHLSHandler = async (
  context: HandlerContext<StreamHandlerRequest>,
) => {
  const logger = getCurrentLogger();
  const { validatedData } = context;
  const { body, headers } = validatedData;
  const { data, metadata } = body;
  const taskId = headers['x-task-id'] as string;
  const { id, videoUrl, userId, keepOriginalSource } = data;

  if (keepOriginalSource) {
    try {
      await finishVideoProcess({
        taskId,
        notificationObject: {
          type: 'video-ready',
          entityId: id,
          entityType: 'video',
          user_id: userId,
        },
        videoId: id,
        videoUpdates: {
          source: videoUrl,
          status: 'ready',
        },
      });

      return AppResponse(true, 'ok', { playableVideoUrl: videoUrl });
    } catch (error) {
      throw CustomError.critical('Hasura server error', {
        originalError: error,
        shouldRetry: true,
        errorCode: HTTP_ERRORS.SERVER_ERROR,
        context: {
          data,
          metadata,
          taskId,
        },
        source: 'apps/io/videos/routes/stream-hls/index.ts',
      });
    }
  }

  logger.info(
    metadata,
    `[/videos/stream-hls-handler] start processing event "${metadata.id}", video "${id}"`,
  );
  const {
    playlistUrl: playableVideoUrl,
    duration,
    thumbnailUrl = '',
  } = await streamM3U8(videoUrl, `videos/${userId}/${id}`, {
    excludePatterns: videoConfig.excludePatterns,
  });

  try {
    await finishVideoProcess({
      taskId,
      notificationObject: {
        type: 'video-ready',
        entityId: id,
        entityType: 'video',
        user_id: userId,
      },
      videoId: id,
      videoUpdates: {
        source: playableVideoUrl,
        status: 'ready',
        thumbnailUrl,
        duration,
      },
    });

    return AppResponse(true, 'ok', { playableVideoUrl });
  } catch (error) {
    throw CustomError.critical('Hasura server error', {
      originalError: error,
      shouldRetry: true,
      errorCode: HTTP_ERRORS.SERVER_ERROR,
      context: {
        data,
        metadata,
        taskId,
      },
      source: 'apps/io/videos/routes/stream-hls/index.ts',
    });
  }
};

export { streamHLSHandler };
