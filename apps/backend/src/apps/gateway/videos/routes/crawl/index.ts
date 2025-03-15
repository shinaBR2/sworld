import { Request, Response } from 'express';
import { TaskEntityType, TaskType } from 'src/database/models/task';
import { ConvertRequest } from 'src/services/videos/convert/schema';
import { verifySignature } from 'src/services/videos/convert/validator';
import { CreateCloudTasksParams, createCloudTasks } from 'src/utils/cloud-task';
import { CustomError } from 'src/utils/custom-error';
import { envConfig } from 'src/utils/envConfig';
import { CRAWL_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';
import { AppResponse } from 'src/utils/schema';
import { queues } from 'src/utils/systemConfig';
import { ValidatedRequest } from 'src/utils/validator';

const crawlHandler = async (req: Request, res: Response) => {
  const { ioServiceUrl } = envConfig;
  const { validatedData } = req as ValidatedRequest<ConvertRequest>;
  const { signatureHeader, event } = validatedData;
  const { data, metadata } = event;

  if (!verifySignature(signatureHeader)) {
    throw CustomError.high('Invalid signature', {
      shouldRetry: false,
      errorCode: CRAWL_ERRORS.MISSING_URL_SELECTOR,
      context: {
        metadata,
        data,
      },
      source: 'apps/gateway/videos/routes/crawl/index.ts',
    });
  }

  const { id: entityId } = data;
  const { streamVideoQueue } = queues;

  const taskConfig: CreateCloudTasksParams = {
    audience: ioServiceUrl as string,
    queue: streamVideoQueue,
    payload: event,
    url: `${ioServiceUrl}/crawlers/crawl-handler`,
    entityId,
    entityType: TaskEntityType.CRAWL_VIDEO,
    type: TaskType.CRAWL,
  };

  const task = await createCloudTasks(taskConfig);
  logger.info({ metadata, task }, 'Crawl task created successfully');
  return res.json(AppResponse(true, 'ok'));
};

export { crawlHandler };
