import { Request, Response } from 'express';
import { TaskEntityType, TaskType } from 'src/database/models/task';
import { getVideoMissingDuration } from 'src/database/queries/videos';
import { verifySignature } from 'src/services/videos/convert/validator';
import { CreateCloudTasksParams, createCloudTasks } from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { AppError, AppResponse } from 'src/utils/schema';
import { queues } from 'src/utils/systemConfig';
import { FixVideosDurationRequest } from './schema';
import { ValidatedRequest } from 'src/utils/validator';

const fixVideosDuration = async (req: Request, res: Response) => {
  const { ioServiceUrl } = envConfig;
  const { validatedData } = req as ValidatedRequest<FixVideosDurationRequest>;
  const { signatureHeader } = validatedData;

  if (!verifySignature(signatureHeader)) {
    return res.json(AppError('Invalid webhook signature for event'));
  }

  // TODO remove this for simplicity
  if (!ioServiceUrl) {
    return res.json(AppError('Missing environment variable'));
  }

  const { streamVideoQueue } = queues;

  try {
    const videos = await getVideoMissingDuration();
    await Promise.all(
      videos.map(async video => {
        const taskConfig: CreateCloudTasksParams = {
          audience: ioServiceUrl,
          queue: streamVideoQueue,
          payload: {
            id: video.id,
          },
          url: `${ioServiceUrl}/fix-duration`,
          entityId: video.id,
          entityType: TaskEntityType.VIDEO,
          type: TaskType.FIX_DURATION,
        };

        await createCloudTasks(taskConfig);
      })
    );

    return res.json(AppResponse(true, 'ok'));
  } catch (error) {
    return res.json(AppError('Failed to create task'));
  }
};

export { fixVideosDuration };
