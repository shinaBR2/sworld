import { Request, Response } from 'express';
import { logger } from 'src/utils/logger';
import { finalizeVideo } from 'src/database/queries/videos';
import { completeTask } from 'src/database/queries/tasks';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';

const importPlatformHandler = async (req: Request, res: Response) => {
  const { data, metadata } = req.body;
  const taskId = req.headers['x-task-id'] as string;
  const { id, videoUrl } = data;

  try {
    logger.info(
      metadata,
      `[/videos/import-platform-handler] start processing event "${metadata.id}", video "${data.id}"`
    );

    await finalizeVideo({
      id,
      source: videoUrl,
      thumbnailUrl: '',
    });

    await completeTask({
      taskId,
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
