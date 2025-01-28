import { ValidatedRequest } from 'src/utils/validator';
import { verifySignature } from './validator';
import { AppError } from 'src/utils/schema';
import { convertVideo } from './handler';
import { logger } from 'src/utils/logger';
import { type ConvertRequest } from './schema';

/**
 * TODO this is only used for legacy monolith architecture
 * Should be removed as soon as microservices ready
 */
const convert = async (request: ValidatedRequest<ConvertRequest>) => {
  const { validatedData } = request;
  const { signatureHeader, event } = validatedData;
  const { data, metadata } = event;

  if (!verifySignature(signatureHeader)) {
    throw AppError('Invalid webhook signature for event', {
      eventId: metadata.id,
    });
  }

  let video;
  try {
    logger.info(
      metadata,
      `[/videos/convert] start processing event "${metadata.id}", video "${data.id}"`
    );
    video = await convertVideo(data);
  } catch (error) {
    throw AppError('Video conversion failed', {
      videoId: data.id,
      error: (error as Error).message,
    });
  }

  return video;
};

export { ConvertRequest, convert };
