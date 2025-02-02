import { logger } from 'src/utils/logger';
import { ConvertHandlerRequest } from './schema';
import { convertVideo } from 'src/services/videos/convert/handler';
import { AppError } from 'src/utils/schema';
import { Response } from 'express';

const convertHandler = async (req: ConvertHandlerRequest, res: Response) => {
  const { data, metadata } = req.body;

  let playableVideoUrl;
  try {
    logger.info(
      metadata,
      `[/videos/convert-handler] start processing event "${metadata.id}", video "${data.id}"`
    );
    playableVideoUrl = await convertVideo(data);
    return res.json({ playableVideoUrl });
  } catch (error) {
    throw AppError('Video conversion failed', {
      videoId: data.id,
      error: (error as Error).message,
    });
  }
};

export { convertHandler };
