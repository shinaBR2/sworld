import { Response } from 'express';
import { ImportHandlerRequest } from './schema';
import { logger } from 'src/utils/logger';
import { AppError } from 'src/utils/schema';
import { finalizeVideo } from 'src/database/queries/videos';

const importPlatformHandler = async (req: ImportHandlerRequest, res: Response) => {
  const { data, metadata } = req.body;
  const { id, videoUrl, userId } = data;

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
