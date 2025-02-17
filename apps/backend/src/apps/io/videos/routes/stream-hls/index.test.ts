import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { streamHLSHandler } from './index';
import { streamM3U8 } from 'src/services/videos/helpers/m3u8';
import { finalizeVideo } from 'src/database/queries/videos';
import { completeTask } from 'src/database/queries/tasks';
import { logger } from 'src/utils/logger';
import { CustomError } from 'src/utils/custom-error';
import { DATABASE_ERRORS, VIDEO_ERRORS } from 'src/utils/error-codes';
import { sequelize } from 'src/database';
import { videoConfig } from 'src/services/videos/config';

// Mock all external dependencies
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

vi.mock('src/database', () => ({
  sequelize: {
    transaction: vi.fn(),
  },
}));

// Mock error codes and CustomError
vi.mock('src/utils/error-codes', () => ({
  DATABASE_ERRORS: {
    DB_ERROR: 'DATABASE_ERROR',
  },
  VIDEO_ERRORS: {
    CONVERSION_FAILED: 'VIDEO_CONVERSION_FAILED',
  },
}));

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    critical: vi.fn((message, details) => {
      const error = new Error(message);
      Object.assign(error, details);
      return error;
    }),
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
  mockTransaction: {
    commit: Mock;
    rollback: Mock;
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
        excludePatterns: videoConfig.excludePatterns,
      },
      mockTransaction: {
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined),
      },
    } as TestContext;

    context.mockResponse = createMockResponse();
    context.mockRequest = createMockRequest(context.defaultData, context.defaultMetadata, context.defaultTaskId);

    // Setup mock transaction
    vi.mocked(sequelize.transaction).mockResolvedValue(context.mockTransaction as any);

    vi.spyOn(context.mockTransaction, 'rollback');

    // Reset mocks
    vi.clearAllMocks();
  });

  const testErrorScenario = async (
    setupMocks: () => void,
    expectedErrorCode: string,
    expectedErrorMessage: string,
    checksAfterError?: () => void
  ) => {
    setupMocks();

    let caughtError: Error | null = null;
    try {
      await streamHLSHandler(context.mockRequest, context.mockResponse);
    } catch (error) {
      caughtError = error as Error;
    }

    expect(caughtError).toBeTruthy();
    expect(caughtError?.message).toBe(expectedErrorMessage);

    if (expectedErrorCode !== VIDEO_ERRORS.CONVERSION_FAILED) {
      expect(context.mockTransaction.rollback).toHaveBeenCalled();
    }

    // Verify CustomError.critical was called
    const criticalCalls = vi.mocked(CustomError.critical).mock.calls;
    expect(criticalCalls.length).toBeGreaterThan(0);

    // Find the call that matches our error
    const matchingCall = criticalCalls.find(
      call => call[0] === expectedErrorMessage && call[1]?.errorCode === expectedErrorCode
    );
    expect(matchingCall).toBeTruthy();

    expect(context.mockResponse.json).not.toHaveBeenCalled();

    checksAfterError?.();
  };

  it('should successfully process video and finalize it', async () => {
    const expectedPlayableUrl = 'https://example.com/video.m3u8';
    vi.mocked(streamM3U8).mockResolvedValueOnce({
      playlistUrl: expectedPlayableUrl,
      duration: 100,
      thumbnailUrl: 'cloud-storage-url',
    } as any);
    vi.mocked(finalizeVideo).mockResolvedValueOnce(1);
    vi.mocked(completeTask).mockResolvedValueOnce(undefined);

    await streamHLSHandler(context.mockRequest, context.mockResponse);

    expect(streamM3U8).toHaveBeenCalledWith(
      context.defaultData.videoUrl,
      `videos/${context.defaultData.userId}/${context.defaultData.id}`,
      context.streamOptions
    );
    expect(finalizeVideo).toHaveBeenCalledWith({
      id: context.defaultData.id,
      source: expectedPlayableUrl,
      thumbnailUrl: 'cloud-storage-url',
      duration: 100,
    });
    expect(completeTask).toHaveBeenCalledWith({
      taskId: context.defaultTaskId,
    });
    expect(context.mockTransaction.commit).toHaveBeenCalled();
    expect(context.mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: expectedPlayableUrl,
    });
  });

  it('should handle streamM3U8 failure', async () => {
    await testErrorScenario(
      () => {
        vi.mocked(streamM3U8).mockRejectedValueOnce(
          CustomError.critical('Stream HLS failed', {
            errorCode: VIDEO_ERRORS.CONVERSION_FAILED,
            shouldRetry: true,
          })
        );
      },
      VIDEO_ERRORS.CONVERSION_FAILED,
      'Stream HLS failed',
      () => {
        expect(finalizeVideo).not.toHaveBeenCalled();
        expect(completeTask).not.toHaveBeenCalled();
      }
    );
  });

  it('should handle finalizeVideo failure', async () => {
    await testErrorScenario(
      () => {
        const expectedPlayableUrl = 'https://example.com/video.m3u8';
        vi.mocked(streamM3U8).mockResolvedValueOnce({
          playlistUrl: expectedPlayableUrl,
          duration: 100,
          thumbnailUrl: 'cloud-storage-url',
        } as any);
        vi.mocked(finalizeVideo).mockRejectedValueOnce(
          CustomError.critical('Failed to save to database', {
            errorCode: DATABASE_ERRORS.DB_ERROR,
            shouldRetry: true,
          })
        );
      },
      DATABASE_ERRORS.DB_ERROR,
      'Failed to save to database',
      () => {
        expect(completeTask).not.toHaveBeenCalled();
      }
    );
  });

  it('should handle completeTask failure', async () => {
    await testErrorScenario(
      () => {
        const expectedPlayableUrl = 'https://example.com/video.m3u8';
        vi.mocked(streamM3U8).mockResolvedValueOnce({
          playlistUrl: expectedPlayableUrl,
          duration: 100,
          thumbnailUrl: 'cloud-storage-url',
        } as any);
        vi.mocked(finalizeVideo).mockResolvedValueOnce(1);
        vi.mocked(completeTask).mockRejectedValueOnce(
          CustomError.critical('Failed to save to database', {
            errorCode: DATABASE_ERRORS.DB_ERROR,
            shouldRetry: true,
          })
        );
      },
      DATABASE_ERRORS.DB_ERROR,
      'Failed to save to database'
    );
  });

  it('should construct correct output path with custom data', async () => {
    const customData = {
      id: 'custom-video',
      videoUrl: 'https://example.com/custom.mp4',
      userId: 'custom-user',
    };
    const customRequest = createMockRequest(customData, context.defaultMetadata);

    vi.mocked(streamM3U8).mockResolvedValueOnce({
      playlistUrl: 'some-url',
      duration: 100,
      thumbnailUrl: 'cloud-storage-url',
    } as any);
    vi.mocked(finalizeVideo).mockResolvedValueOnce(1);
    vi.mocked(completeTask).mockResolvedValueOnce(undefined);

    await streamHLSHandler(customRequest, context.mockResponse);

    expect(streamM3U8).toHaveBeenCalledWith(
      customData.videoUrl,
      `videos/${customData.userId}/${customData.id}`,
      context.streamOptions
    );
  });
});
