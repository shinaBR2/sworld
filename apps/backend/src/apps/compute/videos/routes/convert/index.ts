import { logger } from 'src/utils/logger';
import { ConvertHandlerRequest } from './schema';
import { convertVideo } from 'src/services/videos/convert/handler';
import { AppError } from 'src/utils/schema';
import { Response } from 'express';

const convertHandler = async (req: ConvertHandlerRequest, res: Response) => {
  const { data, metadata } = req.body;

  let video;
  try {
    logger.info(
      metadata,
      `[/videos/convert-handler] start processing event "${metadata.id}", video "${data.id}"`
    );
    video = await convertVideo(data);
    return res.json(video);
  } catch (error) {
    throw AppError('Video conversion failed', {
      videoId: data.id,
      error: (error as Error).message,
    });
  }
};

export { convertHandler };
