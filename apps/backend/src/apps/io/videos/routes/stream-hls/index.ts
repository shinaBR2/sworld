import { Request, Response } from 'express';
import { completeTask } from 'src/database/queries/tasks';
import { finalizeVideo } from 'src/database/queries/videos';
import { videoConfig } from 'src/services/videos/config';
import { streamM3U8 } from 'src/services/videos/helpers/m3u8';
import { logger } from 'src/utils/logger';
import { AppError } from 'src/utils/schema';

const streamHLSHandler = async (req: Request, res: Response) => {
  const { data, metadata } = req.body;
  const taskId = req.headers['x-task-id'] as string;
  const { id, videoUrl, userId } = data;

  try {
    logger.info(metadata, `[/videos/stream-hls-handler] start processing event "${metadata.id}", video "${id}"`);
    const playableVideoUrl = await streamM3U8(videoUrl, `videos/${userId}/${id}`, {
      excludePatterns: videoConfig.excludePatterns,
    });

    await finalizeVideo({
      id,
      source: playableVideoUrl,
      thumbnailUrl: '',
    });

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

export { streamHLSHandler };
