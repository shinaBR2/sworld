import { Response } from 'express';
import { streamM3U8 } from 'src/services/videos/helpers/m3u8';
import { StreamHandlerRequest } from './schema';
import { logger } from 'src/utils/logger';
import { AppError } from 'src/utils/schema';

const streamHLSHandler = async (req: StreamHandlerRequest, res: Response) => {
  const { data, metadata } = req.body;
  const { id, videoUrl, userId } = data;

  try {
    logger.info(
      metadata,
      `[/videos/stream-hls-handler] start processing event "${metadata.id}", video "${data.id}"`
    );
    const playableVideoUrl = await streamM3U8(
      videoUrl,
      `videos/${userId}/${id}`
    );
    return res.json({ playableVideoUrl });
  } catch (error) {
    throw AppError('Video conversion failed', {
      videoId: data.id,
      error: (error as Error).message,
    });
  }
};

export { streamHLSHandler };
