import { Request, Response } from 'express';
import { logger } from 'src/utils/logger';
import { AppError } from 'src/utils/schema';
import { finalizeVideo } from 'src/database/queries/videos';

const importPlatformHandler = async (req: Request, res: Response) => {
  const payload = JSON.parse(Buffer.from(req.body, 'base64').toString('utf-8'));
  const { data, metadata } = payload;
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

    return res.json({ playableVideoUrl: videoUrl });
  } catch (error) {
    throw AppError('Video conversion failed', {
      videoId: data.id,
      error: (error as Error).message,
    });
  }
};

export { importPlatformHandler };
