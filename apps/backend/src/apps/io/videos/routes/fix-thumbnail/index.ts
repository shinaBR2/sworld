import { Request, Response } from 'express';
import { sequelize } from 'src/database';
import { completeTask } from 'src/database/queries/tasks';
import { getVideoById, updateVideoThumbnail } from 'src/database/queries/videos';
import { videoConfig } from 'src/services/videos/config';
import { getDownloadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import { parseM3U8Content } from 'src/services/videos/helpers/m3u8/helpers';
import { processThumbnail } from 'src/services/videos/helpers/thumbnail';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';

const fixThumbnailHandler = async (req: Request, res: Response) => {
  const { id } = req.body;
  const taskId = req.headers['x-task-id'] as string;
  const metadata = {
    id,
    taskId,
  };
  let transaction;

  logger.info(metadata, `[/videos/fix-thumbnail] start processing`);
  const video = await getVideoById(id);

  if (!video) {
    throw CustomError.medium('Video not found', {
      errorCode: VIDEO_ERRORS.FIX_THUMBNAIL_ERROR,
      context: {
        ...metadata,
      },
      source: 'apps/io/videos/routes/fix-thumbnail/index.ts',
    });
  }

  const { source, user_id: userId } = video;
  const { segments } = await parseM3U8Content(source, videoConfig.excludePatterns);

  if (!segments.included.length) {
    throw CustomError.medium('Empty HLS content', {
      errorCode: VIDEO_ERRORS.INVALID_LENGTH,
      context: {
        id,
      },
      source: 'services/videos/helpers/m3u8/index.ts',
    });
  }

  let thumbnailUrl;

  const firstSegment = segments.included[0];
  const thumbnailPath = await processThumbnail({
    url: firstSegment.url,
    duration: firstSegment.duration as number,
    storagePath: `videos/${userId}/${id}`, // TODO refactor to an util
    isSegment: true,
  });
  thumbnailUrl = getDownloadUrl(thumbnailPath);

  if (!thumbnailUrl) {
    logger.error(
      {
        id,
        source,
      },
      'Thumbnail is empty'
    );

    throw CustomError.medium('Invalid generated thumbnail', {
      errorCode: VIDEO_ERRORS.FIX_THUMBNAIL_ERROR,
      context: {
        ...metadata,
        source,
      },
      shouldRetry: true,
      source: 'apps/io/videos/routes/fix-thumbnail/index.ts',
    });
  }

  try {
    transaction = await sequelize.transaction();
    await updateVideoThumbnail({
      id,
      thumbnailUrl,
      transaction,
    });
    await completeTask({
      taskId,
    });
    await transaction.commit();

    return res.json({ taskId });
  } catch (error) {
    await transaction?.rollback();
    throw CustomError.medium('Generate thumbnail failed', {
      originalError: error,
      errorCode: VIDEO_ERRORS.FIX_THUMBNAIL_ERROR,
      context: {
        ...metadata,
      },
      shouldRetry: true,
      source: 'apps/io/videos/routes/fix-thumbnail/index.ts',
    });
  }
};

export { fixThumbnailHandler };
