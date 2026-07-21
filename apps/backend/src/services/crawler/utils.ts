import type { Page } from 'playwright';
import { hh3dHandler } from './hh3d';
import { selectors } from './hh3d/selectors';
import type {
  HandlerOptions,
  RequestHandlerWithState,
  SelectorConfig,
} from './types';

/**
 * Determines the appropriate handler based on the start URLs
 */
const getHandlerType = (startUrls: string[]): string => {
  // Logic to determine which handler to use based on URL patterns
  if (startUrls.some((url) => url.includes('hoathinh3d'))) {
    return 'hh3d';
  }

  // Default handler
  return '';
};

const getSelectors = (handlerType: string) => {
  switch (handlerType) {
    case 'hh3d': {
      return selectors;
    }
    default: {
      throw new Error(`Unsupported handler type: ${handlerType}`);
    }
  }
};

/**
 * Creates and returns the appropriate request handler based on the handler type
 * @param handlerType Type of handler to create
 * @param options Options to pass to the handler
 * @returns Object containing the handler function and its initial state
 */
const createRequestHandler = <T>(
  handlerType: string,
  options: HandlerOptions,
): RequestHandlerWithState<T> => {
  switch (handlerType) {
    case 'hh3d': {
      return hh3dHandler<T>(options);
    }
    default: {
      throw new Error(`Unsupported handler type: ${handlerType}`);
    }
  }
};

const simpleScraper = async (page: Page, selector: SelectorConfig) => {
  const text = await page.locator(selector.selector).textContent();
  return text ?? '';
};

export { createRequestHandler, getHandlerType, getSelectors, simpleScraper };
