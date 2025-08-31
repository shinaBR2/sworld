import type { APIResponse } from 'playwright';
import { CustomError } from 'src/utils/custom-error';
import { CRAWL_ERRORS } from 'src/utils/error-codes';

const scrapeUrl = async (response: APIResponse): Promise<string | null> => {
  let videoUrl: string | null = null;

  try {
    const data = await response.json();
    if (data?.file) {
      videoUrl = data['file'];
    }
  } catch (parseError) {
    throw CustomError.high('Invalid JSON', {
      originalError: parseError,
      shouldRetry: false,
      errorCode: CRAWL_ERRORS.INVALID_JSON,
      context: {
        response,
      },
      source: 'services/crawler/hh3d/scrapers.ts',
    });
  }

  return videoUrl;
};

export { scrapeUrl };
