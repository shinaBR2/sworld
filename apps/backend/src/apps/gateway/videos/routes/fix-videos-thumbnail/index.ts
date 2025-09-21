import { TaskEntityType, TaskType } from 'src/database/models/task';
import { getVideoMissingThumbnail } from 'src/database/queries/videos';
import {
  type CreateCloudTasksParams,
  createCloudTasks,
} from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { AppError, AppResponse } from 'src/utils/schema';
import { queues } from 'src/utils/systemConfig';

const fixVideosThumbnail = async () => {
  const { ioServiceUrl } = envConfig;

  if (!ioServiceUrl) {
    return AppError('Missing environment variable');
  }

  const { streamVideoQueue } = queues;

  try {
    const videos = await getVideoMissingThumbnail();
    await Promise.all(
      videos.map(async (video) => {
        const taskConfig: CreateCloudTasksParams = {
          audience: ioServiceUrl,
          queue: streamVideoQueue,
          payload: {
            id: video.id,
          },
          url: `${ioServiceUrl}/videos/fix-thumbnail`,
          entityId: video.id,
          entityType: TaskEntityType.VIDEO,
          type: TaskType.FIX_THUMBNAIL,
        };

        await createCloudTasks(taskConfig);
      }),
    );

    return AppResponse(true, 'ok');
  } catch (error) {
    return AppError('Failed to create task');
  }
};

export { fixVideosThumbnail };
