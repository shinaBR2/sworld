import { logger } from 'src/utils/logger';
import { convertVideo } from 'src/services/videos/convert/handler';
import { AppError } from 'src/utils/schema';
import { Request, Response } from 'express';

const convertHandler = async (req: Request, res: Response) => {
  const payload = JSON.parse(Buffer.from(req.body, 'base64').toString('utf-8'));
  const { data, metadata } = payload;

  let playableVideoUrl;
  try {
    logger.info(metadata, `[/videos/convert-handler] start processing event "${metadata.id}", video "${data.id}"`);
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
