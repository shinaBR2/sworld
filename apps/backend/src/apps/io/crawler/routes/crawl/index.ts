import { Request, Response } from 'express';
import { completeTask } from 'src/database/queries/tasks';
import { crawl } from 'src/services/crawler';
import { insertVideos } from 'src/services/hasura/mutations/videos/bulk-insert';
import { logger } from 'src/utils/logger';
import { CrawlData } from './type';
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

const crawlHandler = async (req: Request, res: Response) => {
  const taskId = req.headers['x-task-id'] as string;
  const { data } = req.body;
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

  res.json({ result });
};

export { crawlHandler };
