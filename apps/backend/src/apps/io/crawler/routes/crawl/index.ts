import { completeTask } from 'src/database/queries/tasks';
import type { CrawlHandlerRequest } from 'src/schema/videos/crawl';
import { crawl } from 'src/services/crawler';
import { insertVideos } from 'src/services/hasura/mutations/videos/bulk-insert';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';
import type { CrawlData } from './type';
import { buildVariables } from './utils';

/**
 *
 * Problems:
 * - Playlist slug
 * - Video slug
 * - How to handle in case slug is existed?
 * - Frontend should send slug prefix
 * - Maybe adjust the slug unique constrain to conbine with user_id
 * - In case crawl playlist, playlist name is required
 * - In case crawl single video, video title is required
 * - Maybe we can remove slug, just use shortid
 *
 * Some thoughts before sleep
 * - When crawl single video, frontend send { url, videoTitle }
 * - When crawl playlist, frontend send { url, playlistName }
 */

const crawlHandler = async (context: HandlerContext<CrawlHandlerRequest>) => {
  const logger = getCurrentLogger();
  const { validatedData } = context;
  const { body, headers } = validatedData;
  const taskId = headers['x-task-id'] as string;
  const { data } = body;
  const { userId, getSingleVideo, url, title, slugPrefix = '' } = data;

  const inputs = {
    getSingleVideo,
    url,
    title,
    slugPrefix,
    userId,
  };

  const result = await crawl<CrawlData>(inputs, {
    maxRequestsPerCrawl: 100,
    maxConcurrency: 5,
    maxRequestsPerMinute: 20,
  });
  logger.info(inputs, 'crawl success, start inserting');

  const videos = buildVariables(result, {
    getSingleVideo,
    title,
    slugPrefix,
    userId,
  });

  await insertVideos(videos);
  await completeTask({
    taskId,
  });

  return AppResponse(true, 'ok', { result });
};

export { crawlHandler };
