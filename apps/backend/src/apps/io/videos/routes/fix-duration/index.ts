import { Request, Response } from 'express';
import { sequelize } from 'src/database';
import { completeTask } from 'src/database/queries/tasks';
import { getVideoById, updateVideoDuration } from 'src/database/queries/videos';
import { videoConfig } from 'src/services/videos/config';
import { parseM3U8Content } from 'src/services/videos/helpers/m3u8/helpers';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';

const fixDurationHandler = async (req: Request, res: Response) => {
  const { id } = req.body;
  const taskId = req.headers['x-task-id'] as string;
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
    const { duration } = await parseM3U8Content(source, videoConfig.excludePatterns);

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

    return res.json({ taskId });
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
