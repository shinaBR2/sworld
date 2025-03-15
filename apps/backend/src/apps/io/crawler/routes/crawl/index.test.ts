import { Request, Response } from 'express';
import { completeTask } from 'src/database/queries/tasks';
import { crawl } from 'src/services/crawler';
import { insertVideos } from 'src/services/hasura/mutations/videos/bulk-insert';
import { logger } from 'src/utils/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crawlHandler } from './index';
import { buildVariables } from './utils';

// Mock dependencies
vi.mock('src/services/crawler', () => ({
  crawl: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('src/services/hasura/mutations/videos/bulk-insert', () => ({
  insertVideos: vi.fn(),
}));

vi.mock('./utils', () => ({
  buildVariables: vi.fn(),
}));

vi.mock('src/database/queries/tasks', () => ({
  completeTask: vi.fn(),
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

  it('should successfully process video crawling and insertion', async () => {
    const mockCrawlResult = {
      data: [{ videoUrl: 'http://example.com/video1' }, { videoUrl: 'http://example.com/video2' }],
      urls: ['URL_ADDRESS.com/video1', 'URL_ADDRESS.com/video1', 'URL_ADDRESSe.com/video2'],
    };
    const mockVideos = [
      { title: 'Test Video 1', slug: 'test-1', video_url: 'http://example.com/video1', user_id: 'user123' },
      { title: 'Test Video 2', slug: 'test-2', video_url: 'http://example.com/video2', user_id: 'user123' },
    ];

    vi.mocked(crawl).mockResolvedValue(mockCrawlResult);
    vi.mocked(buildVariables).mockReturnValue(mockVideos);
    vi.mocked(insertVideos).mockResolvedValue(undefined);

    mockRequest = {
      body: {
        getSingleVideo: true,
        url: 'http://example.com',
        title: 'Test Title',
        slugPrefix: 'test-',
        userId: 'user123',
      },
      headers: {
        'x-task-id': 'test-task-id',
      },
    };

    await crawlHandler(mockRequest as Request, mockResponse as Response);

    expect(crawl).toHaveBeenCalledWith(
      {
        getSingleVideo: true,
        url: 'http://example.com',
        title: 'Test Title',
        slugPrefix: 'test-',
        userId: 'user123',
      },
      {
        maxRequestsPerCrawl: 100,
        maxConcurrency: 5,
        maxRequestsPerMinute: 20,
      }
    );

    expect(buildVariables).toHaveBeenCalledWith(mockCrawlResult, {
      getSingleVideo: true,
      title: 'Test Title',
      slugPrefix: 'test-',
      userId: 'user123',
    });

    expect(insertVideos).toHaveBeenCalledWith(mockVideos);
    expect(logger.info).toHaveBeenCalledWith(
      {
        getSingleVideo: true,
        title: 'Test Title',
        slugPrefix: 'test-',
        url: 'http://example.com',
        userId: 'user123',
      },
      'crawl success, start inserting'
    );
    expect(jsonMock).toHaveBeenCalledWith({ result: mockCrawlResult });
    expect(completeTask).toHaveBeenCalledWith({
      taskId: 'test-task-id',
    });
  });

  it('should use empty string as default slugPrefix', async () => {
    const mockCrawlResult = {
      data: [{ videoUrl: 'http://example.com/video1' }],
      urls: ['URL_ADDRESS.com/video1', 'URL_ADDRESS.com/video1', 'URL_ADDRESSe.com/video2'],
    };
    const mockVideos = [{ title: 'Test Video', slug: '1', video_url: 'http://example.com/video1', user_id: 'user123' }];

    vi.mocked(crawl).mockResolvedValue(mockCrawlResult);
    vi.mocked(buildVariables).mockReturnValue(mockVideos);

    mockRequest = {
      body: {
        getSingleVideo: true,
        url: 'http://example.com',
        title: 'Test Title',
        userId: 'user123',
      },
      headers: {
        'x-task-id': 'test-task-id',
      },
    };

    await crawlHandler(mockRequest as Request, mockResponse as Response);

    expect(buildVariables).toHaveBeenCalledWith(mockCrawlResult, {
      getSingleVideo: true,
      title: 'Test Title',
      slugPrefix: '',
      userId: 'user123',
    });
  });

  it('should handle crawl errors', async () => {
    const error = new Error('Crawl failed');
    vi.mocked(crawl).mockRejectedValue(error);

    mockRequest = {
      body: {
        getSingleVideo: true,
        url: 'http://example.com',
        title: 'Test Title',
        userId: 'user123',
      },
      headers: {
        'x-task-id': 'test-task-id',
      },
    };

    await expect(crawlHandler(mockRequest as Request, mockResponse as Response)).rejects.toThrow('Crawl failed');
  });
});
