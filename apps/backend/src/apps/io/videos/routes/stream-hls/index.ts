import { Request, Response } from 'express';
import { completeTask } from 'src/database/queries/tasks';
import { finalizeVideo } from 'src/database/queries/videos';
import { videoConfig } from 'src/services/videos/config';
import { streamM3U8 } from 'src/services/videos/helpers/m3u8';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';

const streamHLSHandler = async (req: Request, res: Response) => {
  const { data, metadata } = req.body;
  const taskId = req.headers['x-task-id'] as string;
  const { id, videoUrl, userId } = data;

  try {
    logger.info(metadata, `[/videos/stream-hls-handler] start processing event "${metadata.id}", video "${id}"`);
    const {
      playlistUrl: playableVideoUrl,
      duration,
      thumbnailUrl = '',
    } = await streamM3U8(videoUrl, `videos/${userId}/${id}`, {
      excludePatterns: videoConfig.excludePatterns,
    });

    await finalizeVideo({
      id,
      source: playableVideoUrl,
      thumbnailUrl,
      duration,
    });

    await completeTask({
      taskId,
    });

    return res.json({ playableVideoUrl });
  } catch (error) {
    throw CustomError.critical('Stream HLS failed', {
      originalError: error,
      errorCode: VIDEO_ERRORS.CONVERSION_FAILED,
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
