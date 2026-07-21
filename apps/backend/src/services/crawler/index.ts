import {
  Configuration,
  PlaywrightCrawler,
  type PlaywrightCrawlerOptions,
} from 'crawlee';
import type { CrawlInputs, SelectorConfig } from './types';
import { createRequestHandler } from './utils';
import { validateUrlInput } from './validator';

interface BaseCrawlOptions
  extends Omit<PlaywrightCrawlerOptions, 'requestHandler'> {
  selectors?: SelectorConfig[];
  handlerType?: string;
}

interface CrawlResult<T> {
  data: T[];
  urls: string[];
}

/**
 * Generic crawler function that selects the appropriate handler based on input URLs
 * @template T The type of data that will be collected during crawling
 * @param startUrls Array of URLs to start crawling from
 * @param options Configuration options for the crawler
 * @returns Promise resolving to a CrawlResult object with the collected data
 */
const crawl = async <T>(
  props: CrawlInputs,
  crawlerOptions: BaseCrawlOptions,
): Promise<CrawlResult<T>> => {
  const { getSingleVideo, url, title, slugPrefix } = props;
  const { handlerType, selectors } = validateUrlInput(url);

  // Create request handler specific to the determined type
  const { handler, initialState } = createRequestHandler<T>(handlerType, {
    selectors,
    getSingleVideo,
    title,
    slugPrefix,
  });

  const crawler = new PlaywrightCrawler(
    {
      ...crawlerOptions,
      requestHandler: handler,
    },
    new Configuration({
      persistStorage: false,
    }),
  );

  await crawler.run([url]);

  return {
    data: initialState.data,
    urls: initialState.processedUrls,
  };
};

export { crawl };
