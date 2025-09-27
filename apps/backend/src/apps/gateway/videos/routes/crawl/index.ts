import { TaskEntityType, TaskType } from 'src/database/models/task';
import type { CrawlRequest } from 'src/schema/videos/crawl';
import {
  type CreateCloudTasksParams,
  createCloudTasks,
} from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';
import { queues } from 'src/utils/systemConfig';

const crawlHandler = async (context: HandlerContext<CrawlRequest>) => {
  const logger = getCurrentLogger();
  const { ioServiceUrl } = envConfig;
  const { validatedData } = context;
  const { event } = validatedData;
  const { data, metadata } = event;

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
  return AppResponse(true, 'ok');
};

export { crawlHandler };
