import { nanoid } from 'nanoid';
import { getVideoById } from 'src/services/hasura/queries/videos';
import {
  TaskEntityType,
  TaskType,
} from 'src/services/hasura/mutations/tasks/constants';
import {
  type CreateCloudTasksParams,
  createCloudTasks,
} from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';
import { queues } from 'src/utils/systemConfig';
import type { RepairFmp4Request } from 'src/schema/videos/repair-fmp4';

const VIDEO_HANDLER_PATH = '/videos/repair-fmp4-handler';

const repairFmp4 = async (context: HandlerContext<RepairFmp4Request>) => {
  const logger = getCurrentLogger();
  const { videoId, userId } = context.validatedData;
  const { computeServiceUrl } = envConfig;

  if (!computeServiceUrl) {
    return AppError('Missing compute service URL');
  }

  const video = await getVideoById(videoId);

  if (!video) {
    return AppError(`Video with ID ${videoId} not found`);
  }

  if (video.user_id !== userId) {
    logger.warn(
      { videoId, userId, ownerId: video.user_id },
      '[repairFmp4] ownership check failed',
    );
    return AppError('You do not have permission to modify this video');
  }

  try {
    const metadata = {
      id: nanoid(),
      spanId: nanoid(),
      traceId: nanoid(),
    };

    const taskConfig: CreateCloudTasksParams = {
      audience: computeServiceUrl,
      queue: queues.convertVideoQueue,
      payload: {
        data: { videoId, userId },
        metadata,
      },
      url: `${computeServiceUrl}${VIDEO_HANDLER_PATH}`,
      entityId: videoId,
      entityType: TaskEntityType.VIDEO,
      type: TaskType.REPAIR_FMP4,
    };

    await createCloudTasks(taskConfig);

    return AppResponse(true, 'ok');
  } catch (error) {
    logger.error({ error, videoId }, '[repairFmp4] failed to create task');
    return AppError('Failed to create repair task');
  }
};

export { repairFmp4 };
