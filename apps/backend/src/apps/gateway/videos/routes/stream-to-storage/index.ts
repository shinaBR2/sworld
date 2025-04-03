import { Request, Response } from 'express';
import { TaskEntityType, TaskType } from 'src/database/models/task';
import { ConvertRequest } from 'src/services/videos/convert/schema';
import { verifySignature } from 'src/services/videos/convert/validator';
import { CreateCloudTasksParams, createCloudTasks } from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { logger } from 'src/utils/logger';
import { Platform, urlPatterns } from 'src/utils/patterns';
import { AppError, AppResponse } from 'src/utils/schema';
import { queues } from 'src/utils/systemConfig';
import { ValidatedRequest } from 'src/utils/validator';

const VIDEO_HANDLERS = {
  HLS: '/videos/stream-hls-handler',
  CONVERT: '/videos/convert-handler',
  PLATFORM_IMPORT: '/videos/import-platform-handler',
} as const;

const createVideoTask = async (config: CreateCloudTasksParams) => {
  return await createCloudTasks(config);
};

const buildHandlerUrl = (baseUrl: string, handler: string): string => {
  return `${baseUrl}${handler}`;
};

const streamToStorage = async (req: Request, res: Response) => {
  const { computeServiceUrl, ioServiceUrl } = envConfig;
  const { validatedData } = req as ValidatedRequest<ConvertRequest>;
  const { signatureHeader, event } = validatedData;
  const { data, metadata } = event;

  if (!verifySignature(signatureHeader)) {
    return res.json(
      AppError('Invalid webhook signature for event', {
        eventId: metadata.id,
      })
    );
  }

  // TODO remove this for simplicity
  if (!computeServiceUrl || !ioServiceUrl) {
    return res.json(
      AppError('Missing environment variable', {
        eventId: metadata.id,
      })
    );
  }

  const { id: entityId, platform, fileType, skipProcess } = data;
  const { streamVideoQueue, convertVideoQueue } = queues;

  if (skipProcess) {
    logger.info({ metadata }, 'Skip process');
    return res.json(AppResponse(true, 'ok'));
  }

  const taskConfig: CreateCloudTasksParams = {
    audience: '',
    queue: streamVideoQueue,
    payload: event,
    url: '',
    entityId,
    entityType: TaskEntityType.VIDEO,
    type: TaskType.IMPORT_PLATFORM,
  };
  const allowedPlatforms = Object.keys(urlPatterns) as Platform[];

  try {
    switch (fileType) {
      case 'hls':
        taskConfig.audience = ioServiceUrl;
        taskConfig.url = buildHandlerUrl(ioServiceUrl, VIDEO_HANDLERS.HLS);
        taskConfig.type = TaskType.STREAM_HLS;
        break;
      case 'video':
        taskConfig.audience = computeServiceUrl;
        taskConfig.url = buildHandlerUrl(computeServiceUrl, VIDEO_HANDLERS.CONVERT);
        taskConfig.queue = convertVideoQueue;
        taskConfig.type = TaskType.CONVERT;
        break;
      default:
        // TODO enhance list of allowed platform in the future
        if (platform && allowedPlatforms.includes(platform)) {
          taskConfig.audience = ioServiceUrl;
          taskConfig.url = buildHandlerUrl(ioServiceUrl, VIDEO_HANDLERS.PLATFORM_IMPORT);
          taskConfig.type = TaskType.IMPORT_PLATFORM;
        } else {
          logger.error({ metadata }, 'Invalid source');
          return res.json(AppError('Invalid source'));
        }
    }

    const task = await createVideoTask(taskConfig);
    logger.info({ metadata, task }, 'Video task created successfully');
    return res.json(AppResponse(true, 'ok'));
  } catch (error) {
    return res.json(
      AppError('Failed to create task', {
        eventId: metadata.id,
        error,
      })
    );
  }
};

export { streamToStorage };
