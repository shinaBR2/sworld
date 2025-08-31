import type { Request, Response } from 'express';
import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';

const importPlatformHandler = async (req: Request, res: Response) => {
  const { data, metadata } = req.body;
  const taskId = req.headers['x-task-id'] as string;
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

    return res.json({ playableVideoUrl: videoUrl });
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
