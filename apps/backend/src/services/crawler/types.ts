import type { PlaywrightRequestHandler } from 'crawlee';

interface SelectorConfig {
  selector: string;
  name: string;
  waitForSelectorTimeout?: number;
  required: boolean;
}

interface CrawlInputs {
  getSingleVideo: boolean;
  url: string;
  title: string;
  slugPrefix?: string;
}

interface HandlerOptions extends Omit<CrawlInputs, 'url'> {
  selectors: SelectorConfig[];
}

interface HandlerState<T> {
  data: T[];
  processedUrls: string[];
}

interface RequestHandlerWithState<T> {
  handler: PlaywrightRequestHandler;
  initialState: HandlerState<T>;
}

enum SelectorName {
  TITLE = 'title',
  URL = 'videoUrl',
}

export { SelectorName };
export type {
  SelectorConfig,
  CrawlInputs,
  HandlerOptions,
  HandlerState,
  RequestHandlerWithState,
};
