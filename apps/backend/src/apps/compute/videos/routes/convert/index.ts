import { logger } from 'src/utils/logger';
import { convertVideo } from 'src/services/videos/convert/handler';
import { AppError } from 'src/utils/schema';
import { Request, Response } from 'express';
import { completeTask } from 'src/database/queries/tasks';

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
    throw AppError('Video conversion failed', {
      videoId: data.id,
      error: (error as Error).message,
    });
  }
};

export { convertHandler };
