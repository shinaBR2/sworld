import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ImportHandlerRequest } from 'src/schema/videos/import-platform';
import type { HandlerContext } from 'src/utils/requestHandler';
import { importPlatformHandler } from './index';

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

vi.mock('src/services/hasura/mutations/videos/finalize', () => ({
  finishVideoProcess: vi.fn(),
}));

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    critical: vi.fn().mockImplementation((message, options) => ({
      message,
      ...options,
    })),
  },
}));

interface TestContext {
  mockContext: HandlerContext<ImportHandlerRequest>;
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

const createMockContext = (
  data: any = {},
  metadata: any = {},
  taskId: string = 'task-123',
): HandlerContext<ImportHandlerRequest> =>
  ({
    validatedData: {
      body: {
        data,
        metadata,
      },
      headers: {
        'x-task-id': taskId,
      },
    },
  }) as unknown as HandlerContext<ImportHandlerRequest>;

const setupSuccessfulMocks = () => {
  vi.mocked(finishVideoProcess).mockResolvedValueOnce('uuid');
};

describe('importPlatformHandler', () => {
  let context: TestContext;

  beforeEach(() => {
    const defaultData = {
      id: 'video123',
      videoUrl: 'https://example.com/video.mp4',
      userId: 'user123',
    };

    const defaultMetadata = {
      id: 'event123',
    };

    const defaultTaskId = 'task-123';

    const mockContext = createMockContext(
      defaultData,
      defaultMetadata,
      defaultTaskId,
    );

    context = {
      mockContext,
      defaultData,
      defaultMetadata,
      defaultTaskId,
    };

    vi.clearAllMocks();
  });

  const testSuccessfulImport = async (mockContext = context.mockContext) => {
    setupSuccessfulMocks();

    const result = await importPlatformHandler(mockContext);

    const requestData = mockContext.validatedData.body.data;

    expect(finishVideoProcess).toHaveBeenCalledWith({
      taskId: mockContext.validatedData.headers['x-task-id'],
      notificationObject: {
        type: 'video-ready',
        entityId: requestData.id,
        entityType: 'video',
        user_id: requestData.userId,
      },
      videoId: requestData.id,
      videoUpdates: {
        source: requestData.videoUrl,
        status: 'ready',
        thumbnailUrl: '',
        duration: null,
      },
    });

    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      `[/videos/import-platform-handler] start processing event "${context.defaultMetadata.id}", video "${requestData.id}"`,
    );

    expect(result).toEqual({
      success: true,
      message: 'ok',
      dataObject: {
        playableVideoUrl: requestData.videoUrl,
      },
    });
  };

  it('should successfully process import request and return video URL', async () => {
    await testSuccessfulImport();
  });

  const testErrorScenario = async (
    setupMocks: () => void,
    errorMessage: string,
    checksAfterError?: () => void,
  ) => {
    setupMocks();

    await expect(importPlatformHandler(context.mockContext)).rejects.toThrow(
      'Import from platform failed',
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
      }),
    );

    checksAfterError?.();
  };

  it('should handle Hasura mutation failure', async () => {
    const errorMessage = 'Hasura failure';
    await testErrorScenario(
      () =>
        vi
          .mocked(finishVideoProcess)
          .mockRejectedValueOnce(new Error(errorMessage)),
      errorMessage,
    );
  });

  it('should handle network errors during video processing', async () => {
    const errorMessage = 'Network error';
    await testErrorScenario(
      () =>
        vi
          .mocked(finishVideoProcess)
          .mockRejectedValueOnce(new Error(errorMessage)),
      errorMessage,
    );
  });

  it('should log event start with correct metadata', async () => {
    setupSuccessfulMocks();

    await importPlatformHandler(context.mockContext);

    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      expect.stringContaining(context.defaultData.id),
    );
    expect(logger.info).toHaveBeenCalledWith(
      context.defaultMetadata,
      expect.stringContaining(context.defaultMetadata.id),
    );
  });
});
