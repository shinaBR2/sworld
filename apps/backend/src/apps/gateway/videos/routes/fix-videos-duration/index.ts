import { getVideoMissingDuration } from 'src/services/hasura/queries/videos';
import {
  TaskEntityType,
  TaskType,
} from 'src/services/hasura/mutations/tasks/constants';
import {
  type CreateCloudTasksParams,
  createCloudTasks,
} from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { AppError, AppResponse } from 'src/utils/schema';
import { queues } from 'src/utils/systemConfig';

const fixVideosDuration = async () => {
  const { ioServiceUrl } = envConfig;

  // TODO remove this for simplicity
  if (!ioServiceUrl) {
    return AppError('Missing environment variable');
  }

  const { streamVideoQueue } = queues;

  try {
    const videos = await getVideoMissingDuration();
    await Promise.all(
      videos.map(async (video) => {
        const taskConfig: CreateCloudTasksParams = {
          audience: ioServiceUrl,
          queue: streamVideoQueue,
          payload: {
            id: video.id,
          },
          url: `${ioServiceUrl}/videos/fix-duration`,
          entityId: video.id,
          entityType: TaskEntityType.VIDEO,
          type: TaskType.FIX_DURATION,
        };

        await createCloudTasks(taskConfig);
      }),
    );

    return AppResponse(true, 'ok');
  } catch (error) {
    return AppError('Failed to create task');
  }
};

export { fixVideosDuration };
