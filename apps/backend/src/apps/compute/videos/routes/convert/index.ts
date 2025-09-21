import type { ConvertHandlerRequest } from 'src/schema/videos/convert';
import { convertVideo } from 'src/services/videos/convert/handler';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';

const convertHandler = async (
  context: HandlerContext<ConvertHandlerRequest>,
) => {
  const { validatedData } = context;
  const { body, headers } = validatedData;
  const taskId = headers['x-task-id'] as string;
  const { data, metadata } = body;
  const { id } = data;

  let playableVideoUrl;
  try {
    logger.info(
      metadata,
      `[/videos/convert-handler] start processing event "${metadata.id}", video "${id}"`,
    );
    playableVideoUrl = await convertVideo({
      taskId,
      videoData: data,
    });

    return AppResponse(true, 'ok', { playableVideoUrl });
  } catch (error) {
    throw CustomError.critical('Video conversion failed', {
      originalError: error,
      errorCode: VIDEO_ERRORS.CONVERSION_FAILED,
      context: {
        data,
        metadata,
        taskId,
      },
      source: 'apps/compute/videos/routes/convert/index.ts',
    });
  }
};

export { convertHandler };
