import { CustomError } from 'src/utils/custom-error';
import { getHandlerType, getSelectors } from './utils';
import { CRAWL_ERRORS } from 'src/utils/error-codes';
import { crawlConfig } from 'src/utils/systemConfig';

const validateUrlInput = (url: string) => {
  const { defaultWaitForSelectorTimeout } = crawlConfig;
  const handlerType = getHandlerType([url]);
  const metadata = {
    shouldRetry: false,
    errorCode: CRAWL_ERRORS.UNSUPPORTED_SITE,
    context: {
      url,
    },
    source: 'services/crawler/validator.ts',
  };

  if (!handlerType) {
    throw CustomError.high('Invalid handler type', metadata);
  }

  const selectors = getSelectors(handlerType);

  if (!selectors.length) {
    throw CustomError.high('Missing selectors', metadata);
  }

  return {
    handlerType,
    selectors: selectors.map(selector => ({
      ...selector,
      waitForSelectorTimeout: selector.waitForSelectorTimeout || defaultWaitForSelectorTimeout,
    })),
  };
};

export { validateUrlInput };
