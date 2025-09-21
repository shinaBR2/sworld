import { sequelize } from 'src/database';
import { completeTask } from 'src/database/queries/tasks';
import { getVideoById, updateVideoDuration } from 'src/database/queries/videos';
import type { FixDurationHandlerRequest } from 'src/schema/videos/fix-duration';
import { videoConfig } from 'src/services/videos/config';
import { parseM3U8Content } from 'src/services/videos/helpers/m3u8/helpers';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';

const fixDurationHandler = async (
  context: HandlerContext<FixDurationHandlerRequest>,
) => {
  const { validatedData } = context;
  const { body, headers } = validatedData;
  const { id } = body;
  const taskId = headers['x-task-id'];
  const metadata = {
    id,
    taskId,
  };
  let transaction;

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
    const { duration } = await parseM3U8Content(
      source,
      videoConfig.excludePatterns,
    );

    transaction = await sequelize.transaction();
    await updateVideoDuration({
      id,
      duration,
      transaction,
    });
    await completeTask({
      taskId,
    });
    await transaction.commit();

    return AppResponse(true, 'ok', { taskId });
  } catch (error) {
    await transaction?.rollback();
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
