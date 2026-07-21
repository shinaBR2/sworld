import type { ImportHandlerRequest } from 'src/schema/videos/import-platform';
import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';

const importPlatformHandler = async (
  context: HandlerContext<ImportHandlerRequest>,
) => {
  const logger = getCurrentLogger();
  const { validatedData } = context;
  const { body, headers } = validatedData;
  const { data, metadata } = body;
  const taskId = headers['x-task-id'];
  const { id, videoUrl, userId } = data;

  try {
    logger.info(
      metadata,
      `[/videos/import-platform-handler] start processing event "${metadata.id}", video "${data.id}"`,
    );

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
        thumbnailUrl: '',
        duration: null,
      },
    });

    return AppResponse(true, 'ok', { playableVideoUrl: videoUrl });
  } catch (error) {
    throw CustomError.critical('Import from platform failed', {
      originalError: error,
      errorCode: VIDEO_ERRORS.CONVERSION_FAILED,
      context: {
        data,
        metadata,
        taskId,
      },
      source: 'apps/io/videos/routes/import-platform/index.ts',
    });
  }
};

export { importPlatformHandler };
