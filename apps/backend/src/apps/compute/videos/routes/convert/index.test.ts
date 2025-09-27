import { completeTask } from 'src/database/queries/tasks';
import { convertVideo } from 'src/services/videos/convert/handler';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { convertHandler } from './index';
import type { Context } from 'hono';
import type { ConvertHandlerRequest } from 'src/schema/videos/convert';

interface MockContext extends Context {
  json: Mock;
  set: Mock;
}

interface TestContext {
  mockContext: MockContext;
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
  validatedData: ConvertHandlerRequest;
}

vi.mock('src/utils/schema', () => ({
  AppResponse: vi.fn((success, message, data) => ({
    success,
    message,
    dataObject: data,
  })),
}));

vi.mock('src/services/videos/convert/handler', () => ({
  convertVideo: vi.fn(),
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

vi.mock('src/database/queries/tasks', () => ({
  completeTask: vi.fn(),
}));

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    critical: vi.fn(),
  },
}));

const createMockContext = (
  data: any,
  metadata: any,
  taskId: string,
): MockContext => {
  const validatedData = {
    body: {
      data,
      metadata,
    },
    headers: {
      'x-task-id': taskId,
    },
  };

  return {
    json: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    req: {
      header: (name: string) => (name === 'x-task-id' ? taskId : ''),
    },
    validatedData,
  } as unknown as MockContext;
};

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

    context.mockContext = createMockContext(
      context.defaultData,
      context.defaultMetadata,
      context.defaultTaskId,
    );
    context.validatedData = context.mockContext.validatedData;

    vi.clearAllMocks();
  });

  const testErrorScenario = async (
    setupMocks: () => void,
    errorMessage: string,
    checksAfterError?: () => void,
  ) => {
    setupMocks();

    await expect(convertHandler(context.mockContext as any)).rejects.toThrow(
      'Video conversion failed',
    );
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
      }),
    );

    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      expect.stringContaining('start processing event'),
    );
    expect(convertVideo).toHaveBeenCalledWith({
      taskId: context.defaultTaskId,
      videoData: context.defaultData,
    });
    checksAfterError?.();
    expect(context.mockContext.json).not.toHaveBeenCalled();
  };

  const testSuccessfulConversion = async (
    mockContext = context.mockContext,
    customData = context.defaultData,
  ) => {
    setupSuccessfulMocks(context);

    const result = await convertHandler(mockContext as any);

    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      expect.stringContaining('start processing event'),
    );

    expect(convertVideo).toHaveBeenCalledWith({
      taskId: context.defaultTaskId,
      videoData: customData, // Use the custom data here
    });

    expect(result).toEqual({
      success: true,
      message: 'ok',
      dataObject: {
        playableVideoUrl: context.mockPlayableUrl,
      },
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
      },
    );
  });

  it('should handle different video data', async () => {
    const customData = {
      id: 'custom-video',
      userId: 'custom-user',
      videoUrl: 'https://example.com/custom.mp4',
    };
    const customContext = createMockContext(
      customData,
      context.defaultMetadata,
      context.defaultTaskId,
    );

    await testSuccessfulConversion(customContext, customData);
  });
});
