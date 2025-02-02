import { Request, Response } from 'express';
import { ConvertRequest } from 'src/services/videos/convert/schema';
import { verifySignature } from 'src/services/videos/convert/validator';
import { createCloudTasks } from 'src/utils/cloud-task';
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

interface TaskConfig {
  url: string;
  queue: string;
  payload: Record<string, any>;
}

const createVideoTask = async (config: TaskConfig) => {
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

  const { platform, fileType } = data;
  const { streamVideoQueue, convertVideoQueue } = queues;

  const taskConfig: TaskConfig = {
    queue: streamVideoQueue,
    payload: event,
    url: '',
  };
  const allowedPlatforms = Object.keys(urlPatterns) as Platform[];

  try {
    switch (fileType) {
      case 'hls':
        taskConfig.url = buildHandlerUrl(ioServiceUrl, VIDEO_HANDLERS.HLS);
        break;
      case 'video':
        taskConfig.url = buildHandlerUrl(
          computeServiceUrl,
          VIDEO_HANDLERS.CONVERT
        );
        taskConfig.queue = convertVideoQueue;
        break;
      default:
        // TODO enhance list of allowed platform in the future
        if (platform && allowedPlatforms.includes(platform)) {
          taskConfig.url = buildHandlerUrl(
            ioServiceUrl,
            VIDEO_HANDLERS.PLATFORM_IMPORT
          );
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
