import { Request, Response } from 'express';
import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { videoConfig } from 'src/services/videos/config';
import { streamM3U8 } from 'src/services/videos/helpers/m3u8';
import { CustomError } from 'src/utils/custom-error';
import { HTTP_ERRORS, VIDEO_ERRORS } from 'src/utils/error-codes';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { streamHLSHandler } from './index';

vi.mock('src/services/videos/helpers/m3u8', () => ({
  streamM3U8: vi.fn(),
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

vi.mock('src/services/hasura/mutations/videos/finalize', () => ({
  finishVideoProcess: vi.fn().mockResolvedValue({ id: 'notification-123' }),
}));

// Mock error codes and CustomError
vi.mock('src/utils/error-codes', () => ({
  HTTP_ERRORS: {
    SERVER_ERROR: 'SERVER_ERROR',
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
    } as TestContext;

    context.mockResponse = createMockResponse();
    context.mockRequest = createMockRequest(context.defaultData, context.defaultMetadata, context.defaultTaskId);

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

    await streamHLSHandler(context.mockRequest, context.mockResponse);

    expect(streamM3U8).toHaveBeenCalledWith(
      context.defaultData.videoUrl,
      `videos/${context.defaultData.userId}/${context.defaultData.id}`,
      context.streamOptions
    );
    expect(finishVideoProcess).toHaveBeenCalledWith({
      taskId: context.defaultTaskId,
      notificationObject: {
        type: 'video-ready',
        entityId: context.defaultData.id,
        entityType: 'video',
        user_id: context.defaultData.userId,
      },
      videoId: context.defaultData.id,
      videoUpdates: {
        source: expectedPlayableUrl,
        status: 'ready',
        thumbnailUrl: 'cloud-storage-url',
        duration: 100,
      },
    });
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
        expect(finishVideoProcess).not.toHaveBeenCalled();
      }
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

    await streamHLSHandler(customRequest, context.mockResponse);

    expect(streamM3U8).toHaveBeenCalledWith(
      customData.videoUrl,
      `videos/${customData.userId}/${customData.id}`,
      context.streamOptions
    );
  });

  it('should handle Hasura mutation failure', async () => {
    // Mock successful streamM3U8 response first
    vi.mocked(streamM3U8).mockResolvedValueOnce({
      playlistUrl: 'temp-url',
      duration: 100,
      thumbnailUrl: 'temp-thumbnail',
    } as any);

    // Setup Hasura failure
    const hasuraError = CustomError.critical('Hasura mutation failed', {
      errorCode: HTTP_ERRORS.SERVER_ERROR,
      shouldRetry: true,
    });
    vi.mocked(finishVideoProcess).mockRejectedValueOnce(hasuraError);

    await testErrorScenario(
      () => {
        // Additional mocks can be placed here if needed
      },
      HTTP_ERRORS.SERVER_ERROR,
      'Hasura server error',
      () => {
        // Verify finishVideoProcess was called with expected arguments
        expect(finishVideoProcess).toHaveBeenCalledWith({
          taskId: context.defaultTaskId,
          notificationObject: {
            type: 'video-ready',
            entityId: context.defaultData.id,
            entityType: 'video',
            user_id: context.defaultData.userId,
          },
          videoId: context.defaultData.id,
          videoUpdates: {
            source: 'temp-url',
            status: 'ready',
            thumbnailUrl: 'temp-thumbnail',
            duration: 100,
          },
        });
      }
    );
  });

  it('should skip HLS conversion when keepOriginalSource is true', async () => {
    const customData = {
      ...context.defaultData,
      keepOriginalSource: true,
    };
    const customRequest = createMockRequest(customData, context.defaultMetadata, context.defaultTaskId);

    await streamHLSHandler(customRequest, context.mockResponse);

    // Should not call streamM3U8
    expect(streamM3U8).not.toHaveBeenCalled();

    // Should call finishVideoProcess with original URL
    expect(finishVideoProcess).toHaveBeenCalledWith({
      taskId: context.defaultTaskId,
      notificationObject: {
        type: 'video-ready',
        entityId: context.defaultData.id,
        entityType: 'video',
        user_id: context.defaultData.userId,
      },
      videoId: context.defaultData.id,
      videoUpdates: {
        source: context.defaultData.videoUrl,
        status: 'ready',
      },
    });

    // Should return original URL as playable URL
    expect(context.mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: context.defaultData.videoUrl,
    });
  });

  it('should handle Hasura error when keepOriginalSource is true', async () => {
    const customData = {
      ...context.defaultData,
      keepOriginalSource: true,
    };
    const customRequest = createMockRequest(customData, context.defaultMetadata, context.defaultTaskId);
    context.mockRequest = customRequest; // Important: Update the context request

    // Setup Hasura failure BEFORE testErrorScenario
    const hasuraError = CustomError.critical('Hasura mutation failed', {
      errorCode: HTTP_ERRORS.SERVER_ERROR,
      shouldRetry: true,
    });
    vi.mocked(finishVideoProcess).mockRejectedValueOnce(hasuraError);

    await testErrorScenario(
      () => {
        // Empty setup since mocks are already configured
      },
      HTTP_ERRORS.SERVER_ERROR,
      'Hasura server error',
      () => {
        expect(streamM3U8).not.toHaveBeenCalled();
        expect(context.mockResponse.json).not.toHaveBeenCalled();

        // Verify finishVideoProcess was called with expected arguments
        expect(finishVideoProcess).toHaveBeenCalledWith({
          taskId: context.defaultTaskId,
          notificationObject: {
            type: 'video-ready',
            entityId: context.defaultData.id,
            entityType: 'video',
            user_id: context.defaultData.userId,
          },
          videoId: context.defaultData.id,
          videoUpdates: {
            source: context.defaultData.videoUrl,
            status: 'ready',
          },
        });
      }
    );
  });
});
