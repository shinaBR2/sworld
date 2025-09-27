import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { videoConfig } from 'src/services/videos/config';
import { streamM3U8 } from 'src/services/videos/helpers/m3u8';
import { CustomError } from 'src/utils/custom-error';
import { HTTP_ERRORS, VIDEO_ERRORS } from 'src/utils/error-codes';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { streamHLSHandler } from './index';
import type { StreamHandlerRequest } from 'src/schema/videos/stream-hls';
import type { HandlerContext } from 'src/utils/requestHandler';

// Mock dependencies
vi.mock('src/services/videos/helpers/m3u8', () => ({
  streamM3U8: vi.fn(),
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

// Test interfaces
interface MockContext {
  json: Mock;
  validatedData: {
    body: {
      data: StreamHandlerRequest;
      metadata: Record<string, unknown>;
    };
    headers: {
      'x-task-id': string;
    };
  };
}

interface TestContext {
  mockContext: MockContext;
  defaultData: StreamHandlerRequest;
  defaultMetadata: {
    id: string;
  };
  defaultTaskId: string;
}

// Helper function to create mock context
const createMockContext = (
  data: Partial<StreamHandlerRequest> = {},
  metadata: Record<string, unknown> = {},
  taskId = 'task-123',
): MockContext => ({
  json: vi.fn(),
  validatedData: {
    body: {
      data: {
        id: 'video123',
        videoUrl: 'https://example.com/video.mp4',
        userId: 'user123',
        keepOriginalSource: false,
        ...data,
      },
      metadata: {
        id: 'event123',
        ...metadata,
      },
    },
    headers: { 'x-task-id': taskId },
  },
});

describe('streamHLSHandler', () => {
  let context: TestContext;

  beforeEach(() => {
    context = {
      defaultData: {
        id: 'video123',
        videoUrl: 'https://example.com/video.mp4',
        userId: 'user123',
        keepOriginalSource: false,
      },
      defaultMetadata: {
        id: 'event123',
      },
      defaultTaskId: 'task-123',
    };

    context.mockContext = createMockContext(
      context.defaultData,
      context.defaultMetadata,
      context.defaultTaskId,
    );

    vi.clearAllMocks();
  });

  it('should successfully process video with HLS conversion and finalize it', async () => {
    const expectedPlayableUrl = 'https://example.com/video.m3u8';
    vi.mocked(streamM3U8).mockResolvedValueOnce({
      playlistUrl: expectedPlayableUrl,
      duration: 100,
      thumbnailUrl: 'cloud-storage-url',
    });

    const result = await streamHLSHandler(
      context.mockContext as unknown as HandlerContext<StreamHandlerRequest>,
    );

    expect(streamM3U8).toHaveBeenCalledWith(
      context.defaultData.videoUrl,
      `videos/${context.defaultData.userId}/${context.defaultData.id}`,
      { excludePatterns: videoConfig.excludePatterns },
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

    expect(result).toEqual({
      success: true,
      message: 'ok',
      dataObject: { playableVideoUrl: expectedPlayableUrl },
    });
  });

  it('should use original source when keepOriginalSource is true', async () => {
    const originalSourceData = {
      ...context.defaultData,
      keepOriginalSource: true,
    };

    const mockContext = createMockContext(originalSourceData);

    const result = await streamHLSHandler(
      mockContext as unknown as HandlerContext<StreamHandlerRequest>,
    );

    expect(streamM3U8).not.toHaveBeenCalled();

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

    expect(result).toEqual({
      success: true,
      message: 'ok',
      dataObject: { playableVideoUrl: context.defaultData.videoUrl },
    });
  });

  it('should handle errors during finishVideoProcess with keepOriginalSource', async () => {
    const error = new Error('Database error');
    vi.mocked(finishVideoProcess).mockRejectedValueOnce(error);

    const originalSourceData = {
      ...context.defaultData,
      keepOriginalSource: true,
    };

    const mockContext = createMockContext(originalSourceData);

    await expect(
      streamHLSHandler(
        mockContext as unknown as HandlerContext<StreamHandlerRequest>,
      ),
    ).rejects.toThrow('Hasura server error');

    expect(CustomError.critical).toHaveBeenCalledWith('Hasura server error', {
      originalError: error,
      shouldRetry: true,
      errorCode: HTTP_ERRORS.SERVER_ERROR,
      context: {
        data: originalSourceData,
        metadata: context.defaultMetadata,
        taskId: context.defaultTaskId,
      },
      source: 'apps/io/videos/routes/stream-hls/index.ts',
    });
  });

  it('should handle errors during HLS conversion', async () => {
    const error = new Error('Conversion failed');
    vi.mocked(streamM3U8).mockRejectedValueOnce(error);

    await expect(
      streamHLSHandler(
        context.mockContext as unknown as HandlerContext<StreamHandlerRequest>,
      ),
    ).rejects.toThrow('Conversion failed');

    // The error is not being wrapped in a CustomError, so we don't expect CustomError.critical to be called
    expect(CustomError.critical).not.toHaveBeenCalled();
  });
});
