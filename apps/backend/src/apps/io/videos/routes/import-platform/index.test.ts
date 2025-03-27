import { Request, Response } from 'express';
import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { importPlatformHandler } from './index';

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('src/services/hasura/mutations/videos/finalize', () => ({
  finishVideoProcess: vi.fn(),
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
  vi.mocked(finishVideoProcess).mockResolvedValueOnce('uuid');
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

    expect(finishVideoProcess).toHaveBeenCalledWith({
      taskId: request.headers['x-task-id'], // Use actual request header
      notificationObject: {
        type: 'video-ready',
        entityId: requestData.id, // Use custom request data
        entityType: 'video',
        user_id: requestData.userId, // Use custom request data
      },
      videoId: requestData.id, // Use custom request data
      videoUpdates: {
        source: requestData.videoUrl, // Use custom request data
        status: 'ready',
        thumbnailUrl: '',
        duration: null,
      },
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

  it('should handle Hasura mutation failure', async () => {
    const errorMessage = 'Hasura failure';
    await testErrorScenario(
      () => vi.mocked(finishVideoProcess).mockRejectedValueOnce(new Error(errorMessage)),
      errorMessage,
      () => {}
    );
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
