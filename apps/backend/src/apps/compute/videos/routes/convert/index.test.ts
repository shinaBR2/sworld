import { Request, Response } from 'express';
import { completeTask } from 'src/database/queries/tasks';
import { convertVideo } from 'src/services/videos/convert/handler';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { convertHandler } from './index';

interface MockResponse extends Response {
  json: Mock;
}

interface TestContext {
  mockRequest: Request;
  mockResponse: MockResponse;
  defaultData: {
    id: string;
    userId: string;
    videoUrl: string;
  };
  defaultMetadata: {
    id: string;
    spanId: string;
    traceId: string;
  };
  defaultTaskId: string;
  mockPlayableUrl: string;
}

vi.mock('src/services/videos/convert/handler', () => ({
  convertVideo: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('src/database/queries/tasks', () => ({
  completeTask: vi.fn(),
}));

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    critical: vi.fn(),
  },
}));

const createMockResponse = (): MockResponse =>
  ({
    json: vi.fn(),
  }) as unknown as MockResponse;

const createMockRequest = (data: any, metadata: any, taskId: string): Request =>
  ({
    body: {
      data,
      metadata,
    },
    headers: {
      'x-task-id': taskId,
    },
  }) as unknown as Request;

const setupSuccessfulMocks = (context: TestContext) => {
  vi.mocked(convertVideo).mockResolvedValueOnce(context.mockPlayableUrl);
  vi.mocked(completeTask).mockResolvedValueOnce(undefined);
};

describe('convertHandler', () => {
  let context: TestContext;

  beforeEach(() => {
    context = {
      defaultData: {
        id: 'video-123',
        userId: 'user-456',
        videoUrl: 'https://example.com/video.mp4',
      },
      defaultMetadata: {
        id: 'event-789',
        spanId: 'span-abc',
        traceId: 'trace-def',
      },
      defaultTaskId: 'task-123',
      mockPlayableUrl: 'https://gsapi.com/index.m3u8',
    } as TestContext;

    context.mockResponse = createMockResponse();
    context.mockRequest = createMockRequest(context.defaultData, context.defaultMetadata, context.defaultTaskId);

    vi.clearAllMocks();
  });

  const testErrorScenario = async (setupMocks: () => void, errorMessage: string, checksAfterError?: () => void) => {
    setupMocks();

    await expect(convertHandler(context.mockRequest, context.mockResponse)).rejects.toThrow('Video conversion failed');
    expect(CustomError.critical).toHaveBeenCalledWith(
      'Video conversion failed',
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
        source: 'apps/compute/videos/routes/convert/index.ts',
      })
    );

    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      expect.stringContaining('start processing event')
    );
    expect(convertVideo).toHaveBeenCalledWith({
      taskId: context.defaultTaskId,
      videoData: context.defaultData,
    });
    checksAfterError?.();
    expect(context.mockResponse.json).not.toHaveBeenCalled();
  };

  const testSuccessfulConversion = async (request = context.mockRequest) => {
    setupSuccessfulMocks(context);

    await convertHandler(request, context.mockResponse);

    expect(logger.info).toHaveBeenCalledWith(request.body.metadata, expect.stringContaining('start processing event'));
    expect(convertVideo).toHaveBeenCalledWith({
      taskId: context.defaultTaskId,
      videoData: request.body.data,
    });
    expect(context.mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: context.mockPlayableUrl,
    });
  };

  it('should successfully convert video and return response', async () => {
    await testSuccessfulConversion();
  });

  it('should throw error when video conversion fails', async () => {
    const errorMessage = 'Conversion failed';
    await testErrorScenario(
      () => {
        vi.mocked(convertVideo).mockRejectedValueOnce(new Error(errorMessage));
      },
      errorMessage,
      () => {
        expect(completeTask).not.toHaveBeenCalled();
      }
    );
  });

  it('should handle different video data', async () => {
    const customData = {
      id: 'custom-video',
      userId: 'custom-user',
      videoUrl: 'https://example.com/custom.mp4',
    };
    const customRequest = createMockRequest(customData, context.defaultMetadata, context.defaultTaskId);

    await testSuccessfulConversion(customRequest);
  });
});
