import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { importPlatformHandler } from './index';
import { logger } from 'src/utils/logger';
import { finalizeVideo } from 'src/database/queries/videos';
import { completeTask } from 'src/database/queries/tasks';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('src/database/queries/videos', () => ({
  finalizeVideo: vi.fn(),
}));

vi.mock('src/database/queries/tasks', () => ({
  completeTask: vi.fn(),
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
}

const createMockResponse = (): MockResponse =>
  ({
    json: vi.fn(),
  }) as unknown as MockResponse;

const createMockRequest = (data: any = {}, metadata: any = {}, taskId: string = 'task-123'): Request => {
  const originalPayload = {
    data,
    metadata,
  };

  return {
    body: originalPayload,
    headers: {
      'x-task-id': taskId,
    },
  } as unknown as Request;
};

const setupSuccessfulMocks = () => {
  vi.mocked(finalizeVideo).mockResolvedValueOnce(undefined);
  vi.mocked(completeTask).mockResolvedValueOnce(undefined);
};

describe('importPlatformHandler', () => {
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
    } as TestContext;

    context.mockResponse = createMockResponse();
    context.mockRequest = createMockRequest(context.defaultData, context.defaultMetadata, context.defaultTaskId);

    vi.clearAllMocks();
  });

  const testSuccessfulImport = async (request = context.mockRequest) => {
    setupSuccessfulMocks();

    await importPlatformHandler(request, context.mockResponse);

    const requestData = request.body.data;

    expect(finalizeVideo).toHaveBeenCalledWith({
      id: requestData.id,
      source: requestData.videoUrl,
      thumbnailUrl: '',
    });

    expect(completeTask).toHaveBeenCalledWith({
      taskId: context.defaultTaskId,
    });

    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      `[/videos/import-platform-handler] start processing event "${context.defaultMetadata.id}", video "${requestData.id}"`
    );

    expect(context.mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: requestData.videoUrl,
    });
  };

  it('should successfully process import request and return video URL', async () => {
    await testSuccessfulImport();
  });

  const testErrorScenario = async (setupMocks: () => void, errorMessage: string, checksAfterError?: () => void) => {
    setupMocks();

    await expect(importPlatformHandler(context.mockRequest, context.mockResponse)).rejects.toThrow(
      'Import from platform failed'
    );

    expect(CustomError.critical).toHaveBeenCalledWith(
      'Import from platform failed',
      expect.objectContaining({
        originalError: expect.objectContaining({
          message: errorMessage,
        }),
        errorCode: VIDEO_ERRORS.CONVERSION_FAILED,
        context: {
          data: context.defaultData,
          metadata: context.defaultMetadata,
          taskId: context.defaultTaskId,
        },
        source: 'apps/io/videos/routes/import-platform/index.ts',
      })
    );

    checksAfterError?.();
    expect(context.mockResponse.json).not.toHaveBeenCalled();
  };

  it('should throw error when finalizeVideo fails', async () => {
    const errorMessage = 'Database error';
    await testErrorScenario(
      () => {
        vi.mocked(finalizeVideo).mockRejectedValueOnce(new Error(errorMessage));
      },
      errorMessage,
      () => {
        expect(completeTask).not.toHaveBeenCalled();
      }
    );
  });

  it('should throw error when completeTask fails', async () => {
    const errorMessage = 'Failed to complete task';
    await testErrorScenario(() => {
      vi.mocked(finalizeVideo).mockResolvedValueOnce(undefined);
      vi.mocked(completeTask).mockRejectedValueOnce(new Error(errorMessage));
    }, errorMessage);
  });

  it('should log event start with correct metadata', async () => {
    setupSuccessfulMocks();

    await importPlatformHandler(context.mockRequest, context.mockResponse);

    expect(logger.info).toHaveBeenCalledWith(context.defaultMetadata, expect.stringContaining(context.defaultData.id));
    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      expect.stringContaining(context.defaultMetadata.id)
    );
  });

  it('should handle requests with different data values', async () => {
    const customData = {
      id: 'custom-video',
      videoUrl: 'https://example.com/custom.mp4',
      userId: 'custom-user',
    };
    const customRequest = createMockRequest(customData, context.defaultMetadata);

    await testSuccessfulImport(customRequest);
  });
});
