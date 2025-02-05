import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { streamHLSHandler } from './index';
import { streamM3U8 } from 'src/services/videos/helpers/m3u8';
import { finalizeVideo } from 'src/database/queries/videos';
import { logger } from 'src/utils/logger';
import { completeTask } from 'src/database/queries/tasks';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';

// Mocks setup
vi.mock('src/database/queries/videos', () => ({
  finalizeVideo: vi.fn(),
}));

vi.mock('src/services/videos/helpers/m3u8', () => ({
  streamM3U8: vi.fn(),
}));

vi.mock('src/database/queries/tasks', () => ({
  completeTask: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('src/services/videos/config', () => ({
  videoConfig: {
    excludePatterns: [/\/adjump\//, /\/ads\//, /\/commercial\//],
  },
}));

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    critical: vi.fn(),
  },
}));

interface MockResponse extends Response {
  json: Mock;
}

interface TestContext {
  mockRequest: Request;
  mockResponse: MockResponse;
  defaultData: {
    id: string;
    videoUrl: string;
    userId: string;
  };
  defaultMetadata: {
    id: string;
  };
  defaultTaskId: string;
  streamOptions: {
    excludePatterns: RegExp[];
  };
}

const createMockResponse = (): MockResponse =>
  ({
    json: vi.fn(),
  }) as unknown as MockResponse;

const createMockRequest = (data: any = {}, metadata: any = {}, taskId: string = 'task-123'): Request =>
  ({
    body: { data, metadata },
    headers: { 'x-task-id': taskId },
  }) as unknown as Request;

describe('streamHLSHandler', () => {
  let context: TestContext;

  beforeEach(() => {
    context = {
      defaultData: {
        id: 'video123',
        videoUrl: 'https://example.com/video.mp4',
        userId: 'user123',
      },
      defaultMetadata: {
        id: 'event123',
      },
      defaultTaskId: 'task-123',
      streamOptions: {
        excludePatterns: [/\/adjump\//, /\/ads\//, /\/commercial\//],
      },
    } as TestContext;

    context.mockResponse = createMockResponse();
    context.mockRequest = createMockRequest(context.defaultData, context.defaultMetadata, context.defaultTaskId);

    vi.clearAllMocks();
  });

  const testErrorScenario = async (setupMocks: () => void, errorMessage: string, checksAfterError?: () => void) => {
    setupMocks();

    await expect(streamHLSHandler(context.mockRequest, context.mockResponse)).rejects.toThrow('Stream HLS failed');

    expect(CustomError.critical).toHaveBeenCalledWith('Stream HLS failed', {
      originalError: expect.objectContaining({
        message: errorMessage,
      }),
      errorCode: VIDEO_ERRORS.CONVERSION_FAILED,
      context: {
        data: context.defaultData,
        metadata: context.defaultMetadata,
        taskId: context.defaultTaskId,
      },
      source: 'apps/io/videos/routes/stream-hls/index.ts',
    });

    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      expect.stringContaining(
        `start processing event "${context.defaultMetadata.id}", video "${context.defaultData.id}"`
      )
    );

    checksAfterError?.();
    expect(context.mockResponse.json).not.toHaveBeenCalled();
  };

  it('should successfully process video and finalize it', async () => {
    const expectedPlayableUrl = 'https://example.com/video.m3u8';
    vi.mocked(streamM3U8).mockResolvedValueOnce(expectedPlayableUrl);
    vi.mocked(finalizeVideo).mockResolvedValueOnce(1);

    await streamHLSHandler(context.mockRequest, context.mockResponse);

    expect(streamM3U8).toHaveBeenCalledWith(
      context.defaultData.videoUrl,
      `videos/${context.defaultData.userId}/${context.defaultData.id}`,
      context.streamOptions
    );
    expect(finalizeVideo).toHaveBeenCalledWith({
      id: context.defaultData.id,
      source: expectedPlayableUrl,
      thumbnailUrl: '',
    });
    expect(completeTask).toHaveBeenCalledWith({
      taskId: context.defaultTaskId,
    });
    expect(context.mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: expectedPlayableUrl,
    });
  });

  it('should handle streamM3U8 failure', async () => {
    const errorMessage = 'Stream HLS failed';
    await testErrorScenario(
      () => {
        vi.mocked(streamM3U8).mockRejectedValueOnce(new Error(errorMessage));
      },
      errorMessage,
      () => {
        expect(finalizeVideo).not.toHaveBeenCalled();
        expect(completeTask).not.toHaveBeenCalled();
      }
    );
  });

  it('should handle finalizeVideo failure', async () => {
    const errorMessage = 'Database update failed';
    await testErrorScenario(
      () => {
        const expectedPlayableUrl = 'https://example.com/video.m3u8';
        vi.mocked(streamM3U8).mockResolvedValueOnce(expectedPlayableUrl);
        vi.mocked(finalizeVideo).mockRejectedValueOnce(new Error(errorMessage));
      },
      errorMessage,
      () => {
        expect(completeTask).not.toHaveBeenCalled();
      }
    );
  });

  it('should handle completeTask failure', async () => {
    const errorMessage = 'Failed to complete task';
    await testErrorScenario(() => {
      const expectedPlayableUrl = 'https://example.com/video.m3u8';
      vi.mocked(streamM3U8).mockResolvedValueOnce(expectedPlayableUrl);
      vi.mocked(finalizeVideo).mockResolvedValueOnce(1);
      vi.mocked(completeTask).mockRejectedValueOnce(new Error(errorMessage));
    }, errorMessage);
  });

  it('should construct correct output path with custom data', async () => {
    const customData = {
      id: 'custom-video',
      videoUrl: 'https://example.com/custom.mp4',
      userId: 'custom-user',
    };
    const customRequest = createMockRequest(customData, context.defaultMetadata);

    vi.mocked(streamM3U8).mockResolvedValueOnce('some-url');
    vi.mocked(finalizeVideo).mockResolvedValueOnce(1);

    await streamHLSHandler(customRequest, context.mockResponse);

    expect(streamM3U8).toHaveBeenCalledWith(
      customData.videoUrl,
      `videos/${customData.userId}/${customData.id}`,
      context.streamOptions
    );
  });
});
