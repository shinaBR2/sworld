import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { convertHandler } from './index';
import { convertVideo } from 'src/services/videos/convert/handler';
import { logger } from 'src/utils/logger';
import { completeTask } from 'src/database/queries/tasks';

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

vi.mock('src/utils/schema', () => ({
  AppError: vi.fn((message: string, details: object) => ({
    message,
    details,
  })),
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

    await expect(convertHandler(context.mockRequest, context.mockResponse)).rejects.toMatchObject({
      message: 'Video conversion failed',
      details: {
        videoId: context.defaultData.id,
        error: errorMessage,
      },
    });

    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      expect.stringContaining('start processing event')
    );
    expect(convertVideo).toHaveBeenCalledWith(context.defaultData);
    checksAfterError?.();
    expect(context.mockResponse.json).not.toHaveBeenCalled();
  };

  const testSuccessfulConversion = async (request = context.mockRequest) => {
    setupSuccessfulMocks(context);

    await convertHandler(request, context.mockResponse);

    expect(logger.info).toHaveBeenCalledWith(request.body.metadata, expect.stringContaining('start processing event'));
    expect(convertVideo).toHaveBeenCalledWith(request.body.data);
    expect(completeTask).toHaveBeenCalledWith({
      taskId: request.headers['x-task-id'] as string,
    });
    expect(context.mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: context.mockPlayableUrl,
    });
  };

  it('should successfully convert video and return response', async () => {
    await testSuccessfulConversion();
  });

  it('should throw AppError when video conversion fails', async () => {
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

  it('should throw AppError when task completion fails', async () => {
    const errorMessage = 'Failed to complete task';
    await testErrorScenario(() => {
      vi.mocked(convertVideo).mockResolvedValueOnce(context.mockPlayableUrl);
      vi.mocked(completeTask).mockRejectedValueOnce(new Error(errorMessage));
    }, errorMessage);
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
