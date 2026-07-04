import { fixVideoDuration } from 'src/services/hasura/mutations/videos/fixDuration';
import { getVideoById } from 'src/services/hasura/queries/videos';
import type { FixDurationHandlerRequest } from 'src/schema/videos/fix-duration';
import { videoConfig } from 'src/services/videos/config';
import { parseM3U8Content } from 'src/services/videos/helpers/m3u8/helpers';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';

const fixDurationHandler = async (
  context: HandlerContext<FixDurationHandlerRequest>,
) => {
  const logger = getCurrentLogger();
  const { validatedData } = context;
  const { body, headers } = validatedData;
  const { id } = body;
  const taskId = headers['x-task-id'];
  const metadata = {
    id,
    taskId,
  };

  try {
    logger.info(metadata, `[/videos/fix-duration] start processing`);
    const video = await getVideoById(id);

    if (!video) {
      throw CustomError.medium('Video not found', {
        errorCode: VIDEO_ERRORS.FIX_DURATION_ERROR,
        context: {
          ...metadata,
        },
        source: 'apps/io/videos/routes/fix-duration/index.ts',
      });
    }

    const { source } = video;

    if (!source) {
      throw CustomError.medium('Video source is missing', {
        errorCode: VIDEO_ERRORS.FIX_DURATION_ERROR,
        context: {
          ...metadata,
        },
        source: 'apps/io/videos/routes/fix-duration/index.ts',
      });
    }

    const { duration } = await parseM3U8Content(
      source,
      videoConfig.excludePatterns,
    );

    await fixVideoDuration({
      id,
      duration,
      taskId,
    });

    return AppResponse(true, 'ok', { taskId });
  } catch (error) {
    throw CustomError.medium('Fix duration failed', {
      originalError: error,
      errorCode: VIDEO_ERRORS.FIX_DURATION_ERROR,
      context: {
        ...metadata,
      },
      source: 'apps/io/videos/routes/fix-duration/index.ts',
    });
  }
};

export { fixDurationHandler };
