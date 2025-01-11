import { ValidatedRequest } from 'src/utils/validator';
import { verifySignature } from './validator';
import { AppError } from 'src/utils/schema';
import { convertVideo } from './handler';
import { logger } from 'src/utils/logger';

interface ConvertData {
  id: string;
  video_url: string;
  user_id: string;
}

interface EventMetadata {
  id: string;
  spanId: string;
  traceId: string;
}

interface EventData {
  data: ConvertData;
  metadata: EventMetadata;
}

interface ConvertRequest {
  event: EventData;
  contentTypeHeader: string;
  signatureHeader: string;
}

const extractVideoData = (data: ConvertData) => {
  const { id, video_url: videoUrl, user_id: userId } = data;
  return { id, videoUrl, userId };
};

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
      `[/videos/convert] start processing event ${metadata.id}, video ${data.id}`
    );
    video = await convertVideo(extractVideoData(data));
  } catch (error) {
    throw AppError('Video conversion failed', {
      videoId: data.id,
      error: (error as Error).message,
    });
  }

  return video;
};

export { ConvertRequest, convert };
