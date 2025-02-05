import { logger } from 'src/utils/logger';
import { convertVideo } from 'src/services/videos/convert/handler';
import { Request, Response } from 'express';
import { completeTask } from 'src/database/queries/tasks';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';

const convertHandler = async (req: Request, res: Response) => {
  const taskId = req.headers['x-task-id'] as string;
  const { data, metadata } = req.body;
  const { id } = data;

  let playableVideoUrl;
  try {
    logger.info(metadata, `[/videos/convert-handler] start processing event "${metadata.id}", video "${id}"`);
    playableVideoUrl = await convertVideo(data);

    await completeTask({
      taskId,
    });

    return res.json({ playableVideoUrl });
  } catch (error) {
    throw CustomError.critical('Video conversion failed', {
      originalError: error,
      errorCode: VIDEO_ERRORS.CONVERSION_FAILED,
      context: {
        data,
        metadata,
        taskId,
      },
      source: 'apps/compute/videos/routes/convert/index.ts',
    });
  }
};

export { convertHandler };
