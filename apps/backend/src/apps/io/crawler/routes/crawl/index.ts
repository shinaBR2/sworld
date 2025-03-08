import { Request, Response } from 'express';
import { crawl } from 'src/services/crawler';
import { logger } from 'src/utils/logger';

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
  const { getSingleVideo, url, title, slugPrefix = '' } = req.body;

  if (typeof getSingleVideo == 'undefined' || !url || !title) {
    return res.status(400).json({
      message: 'Invalid request body',
    });
  }

  const result = await crawl(
    {
      getSingleVideo,
      url,
      title,
      slugPrefix,
    },
    {
      maxRequestsPerCrawl: 100,
      maxConcurrency: 5,
      maxRequestsPerMinute: 20,
    }
  );
  logger.info(result, 'after crawl');

  res.json({ result });
};

export { crawlHandler };
