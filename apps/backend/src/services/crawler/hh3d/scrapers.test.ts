import type { APIResponse } from 'playwright';
import { CRAWL_ERRORS } from 'src/utils/error-codes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { scrapeUrl } from './scrapers';

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    high: vi.fn().mockImplementation((message, options) => ({
      message,
      ...options,
    })),
  },
}));

describe('scrapeUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract video URL from valid JSON response', async () => {
    const mockResponse = {
      json: () => Promise.resolve({ file: 'http://example.com/video.mp4' }),
    } as APIResponse;

    const result = await scrapeUrl(mockResponse);
    expect(result).toBe('http://example.com/video.mp4');
  });

  it('should return null when file property is missing', async () => {
    const mockResponse = {
      json: () => Promise.resolve({ someOtherProperty: 'value' }),
    } as APIResponse;

    const result = await scrapeUrl(mockResponse);
    expect(result).toBeNull();
  });

  it('should return null when response is empty object', async () => {
    const mockResponse = {
      json: () => Promise.resolve({}),
    } as APIResponse;

    const result = await scrapeUrl(mockResponse);
    expect(result).toBeNull();
  });

  it('should call CustomError.high with correct params when JSON parsing fails', async () => {
    const mockError = new Error('Invalid JSON');
    const mockResponse = {
      json: () => Promise.reject(mockError),
    } as APIResponse;

    await expect(scrapeUrl(mockResponse)).rejects.toBeDefined();

    const { CustomError } = await import('src/utils/custom-error');
    expect(CustomError.high).toHaveBeenCalledWith('Invalid JSON', {
      originalError: mockError,
      shouldRetry: false,
      errorCode: CRAWL_ERRORS.INVALID_JSON,
      context: {
        response: mockResponse,
      },
      source: 'services/crawler/hh3d/scrapers.ts',
    });
    expect(CustomError.high).toHaveBeenCalledTimes(1);
  });
});
