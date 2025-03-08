import { Request, Response } from 'express';
import { crawl } from 'src/services/crawler';
import { logger } from 'src/utils/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crawlHandler } from './index';

// Mock dependencies
vi.mock('src/services/crawler', () => ({
  crawl: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('crawlHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: jsonMock,
    };
    vi.clearAllMocks();
  });

  it('should return 400 when getSingleVideo is undefined', async () => {
    mockRequest = {
      body: {
        url: 'http://example.com',
        title: 'Test Title',
      },
    };

    await crawlHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Invalid request body',
    });
  });

  it('should return 400 when url is missing', async () => {
    mockRequest = {
      body: {
        getSingleVideo: true,
        title: 'Test Title',
      },
    };

    await crawlHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Invalid request body',
    });
  });

  it('should return 400 when title is missing', async () => {
    mockRequest = {
      body: {
        getSingleVideo: true,
        url: 'http://example.com',
      },
    };

    await crawlHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Invalid request body',
    });
  });

  it('should call crawl with correct parameters and return result', async () => {
    const mockResult = { data: 'test data' };
    vi.mocked(crawl).mockResolvedValue(mockResult);

    mockRequest = {
      body: {
        getSingleVideo: true,
        url: 'http://example.com',
        title: 'Test Title',
        slugPrefix: 'test-',
      },
    };

    await crawlHandler(mockRequest as Request, mockResponse as Response);

    expect(crawl).toHaveBeenCalledWith(
      {
        getSingleVideo: true,
        url: 'http://example.com',
        title: 'Test Title',
        slugPrefix: 'test-',
      },
      {
        maxRequestsPerCrawl: 100,
        maxConcurrency: 5,
        maxRequestsPerMinute: 20,
      }
    );

    expect(logger.info).toHaveBeenCalledWith(mockResult, 'after crawl');
    expect(jsonMock).toHaveBeenCalledWith({ result: mockResult });
  });

  it('should use empty string as default slugPrefix', async () => {
    const mockResult = { data: 'test data' };
    vi.mocked(crawl).mockResolvedValue(mockResult);

    mockRequest = {
      body: {
        getSingleVideo: true,
        url: 'http://example.com',
        title: 'Test Title',
      },
    };

    await crawlHandler(mockRequest as Request, mockResponse as Response);

    expect(crawl).toHaveBeenCalledWith(
      {
        getSingleVideo: true,
        url: 'http://example.com',
        title: 'Test Title',
        slugPrefix: '',
      },
      {
        maxRequestsPerCrawl: 100,
        maxConcurrency: 5,
        maxRequestsPerMinute: 20,
      }
    );
  });

  it('should handle crawl errors', async () => {
    const error = new Error('Crawl failed');
    vi.mocked(crawl).mockRejectedValue(error);

    mockRequest = {
      body: {
        getSingleVideo: true,
        url: 'http://example.com',
        title: 'Test Title',
      },
    };

    await expect(crawlHandler(mockRequest as Request, mockResponse as Response)).rejects.toThrow('Crawl failed');
  });
});
