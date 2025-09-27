import { completeTask } from 'src/database/queries/tasks';
import { crawl } from 'src/services/crawler';
import { insertVideos } from 'src/services/hasura/mutations/videos/bulk-insert';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crawlHandler } from './index';
import { buildVariables } from './utils';
import type { HandlerContext } from 'src/utils/requestHandler';

// Mock dependencies
vi.mock('src/services/crawler', () => ({
  crawl: vi.fn(),
}));

vi.mock('src/utils/logger', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };

  return {
    logger: mockLogger,
    getCurrentLogger: vi.fn(() => mockLogger),
  };
});

vi.mock('src/services/hasura/mutations/videos/bulk-insert', () => ({
  insertVideos: vi.fn(),
}));
vi.mock('./utils', () => ({
  buildVariables: vi.fn(),
}));

vi.mock('src/database/queries/tasks', () => ({
  completeTask: vi.fn(),
}));

vi.mock('src/utils/schema', () => ({
  AppResponse: vi.fn((success, message, data) => ({ success, message, data })),
}));

describe('crawlHandler', () => {
  let mockContext: HandlerContext<any>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContext = {
      validatedData: {
        body: {
          data: {
            getSingleVideo: true,
            url: 'http://example.com',
            title: 'Test Title',
            slugPrefix: 'test-',
            userId: 'user123',
          },
          metadata: {
            id: 'test-id',
            spanId: 'test-span-id',
            traceId: 'test-trace-id',
          },
        },
        headers: {
          'x-task-id': 'test-task-id',
          'content-type': 'application/json',
        },
      },
    } as unknown as HandlerContext<any>;
  });

  it('should successfully process video crawling and insertion', async () => {
    const mockCrawlResult = {
      data: [
        { videoUrl: 'http://example.com/video1' },
        { videoUrl: 'http://example.com/video2' },
      ],
      urls: [
        'URL_ADDRESS.com/video1',
        'URL_ADDRESS.com/video1',
        'URL_ADDRESSe.com/video2',
      ],
    };
    const mockVideos = [
      {
        title: 'Test Video 1',
        slug: 'test-1',
        video_url: 'http://example.com/video1',
        user_id: 'user123',
      },
      {
        title: 'Test Video 2',
        slug: 'test-2',
        video_url: 'http://example.com/video2',
        user_id: 'user123',
      },
    ];

    vi.mocked(crawl).mockResolvedValue(mockCrawlResult);
    vi.mocked(buildVariables).mockReturnValue(mockVideos);
    vi.mocked(insertVideos).mockResolvedValue(undefined);

    const result = await crawlHandler(mockContext);

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
      },
    );

    expect(buildVariables).toHaveBeenCalledWith(mockCrawlResult, {
      getSingleVideo: true,
      title: 'Test Title',
      slugPrefix: 'test-',
      userId: 'user123',
    });

    expect(insertVideos).toHaveBeenCalledWith(mockVideos);

    expect(result).toEqual({
      success: true,
      message: 'ok',
      data: { result: mockCrawlResult },
    });

    expect(completeTask).toHaveBeenCalledWith({
      taskId: 'test-task-id',
    });
  });

  it('should use empty string as default slugPrefix', async () => {
    const mockCrawlResult = {
      data: [{ videoUrl: 'http://example.com/video1' }],
      urls: [
        'URL_ADDRESS.com/video1',
        'URL_ADDRESS.com/video1',
        'URL_ADDRESSe.com/video2',
      ],
    };
    const mockVideos = [
      {
        title: 'Test Video',
        slug: '1',
        video_url: 'http://example.com/video1',
        user_id: 'user123',
      },
    ];

    vi.mocked(crawl).mockResolvedValue(mockCrawlResult);
    vi.mocked(buildVariables).mockReturnValue(mockVideos);

    // Remove slugPrefix from the test data
    const testContext = {
      ...mockContext,
      validatedData: {
        ...mockContext.validatedData,
        body: {
          ...mockContext.validatedData.body,
          data: {
            ...mockContext.validatedData.body.data,
            slugPrefix: undefined,
          },
        },
      },
    } as unknown as HandlerContext<any>;

    await crawlHandler(testContext);

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

    // Remove slugPrefix for this test
    const testContext = {
      ...mockContext,
      validatedData: {
        ...mockContext.validatedData,
        body: {
          ...mockContext.validatedData.body,
          data: {
            ...mockContext.validatedData.body.data,
            slugPrefix: undefined,
          },
        },
      },
    };

    await expect(crawlHandler(testContext)).rejects.toThrow('Crawl failed');
  });
});
