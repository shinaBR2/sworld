import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fixDurationHandler } from './index';
import { fixVideoDuration } from 'src/services/hasura/mutations/videos/fixDuration';
import { getVideoById } from 'src/services/hasura/queries/videos';
import { parseM3U8Content } from 'src/services/videos/helpers/m3u8/helpers';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import type { HandlerContext } from 'src/utils/requestHandler';
import type { FixDurationHandlerRequest } from 'src/schema/videos/fix-duration';

// Mock dependencies
vi.mock('src/services/hasura/queries/videos', () => ({
  getVideoById: vi.fn(),
}));

vi.mock('src/services/hasura/mutations/videos/fixDuration', () => ({
  fixVideoDuration: vi.fn(),
}));

vi.mock('src/services/videos/helpers/m3u8/helpers', () => ({
  parseM3U8Content: vi.fn(),
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

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    medium: vi.fn().mockImplementation((message, options) => {
      throw new Error(message);
    }),
  },
}));

const createMockContext = (
  data: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) =>
  ({
    validatedData: {
      body: data,
      headers,
    },
  }) as unknown as HandlerContext<FixDurationHandlerRequest>;

describe('fixDurationHandler', () => {
  let mockContext: HandlerContext<FixDurationHandlerRequest>;
  const defaultData = { id: 'video-123' };
  const defaultHeaders = { 'x-task-id': 'task-456' };

  beforeEach(() => {
    mockContext = createMockContext(defaultData, defaultHeaders);
    vi.clearAllMocks();
  });

  it('should successfully fix video duration', async () => {
    const mockVideo = {
      id: 'video-123',
      source: 'video-source',
    };
    const mockDuration = 120;

    (getVideoById as Mock).mockResolvedValue(mockVideo);
    (parseM3U8Content as Mock).mockResolvedValue({ duration: mockDuration });
    (fixVideoDuration as Mock).mockResolvedValue({});

    const result = await fixDurationHandler(mockContext);

    expect(getVideoById).toHaveBeenCalledWith('video-123');
    expect(parseM3U8Content).toHaveBeenCalledWith(
      'video-source',
      expect.any(Array),
    );
    expect(fixVideoDuration).toHaveBeenCalledWith({
      id: 'video-123',
      duration: mockDuration,
      taskId: 'task-456',
    });
    expect(result).toEqual({
      success: true,
      message: 'ok',
      dataObject: { taskId: 'task-456' },
    });
  });

  it('should throw error when video is not found', async () => {
    (getVideoById as Mock).mockResolvedValue(null);

    await expect(fixDurationHandler(mockContext)).rejects.toThrow(
      'Fix duration failed',
    );

    expect(CustomError.medium).toHaveBeenCalledWith('Video not found', {
      errorCode: VIDEO_ERRORS.FIX_DURATION_ERROR,
      context: {
        id: 'video-123',
        taskId: 'task-456',
      },
      source: 'apps/io/videos/routes/fix-duration/index.ts',
    });
  });

  it('should handle errors during duration parsing', async () => {
    const mockVideo = {
      id: 'video-123',
      source: 'video-source',
    };
    const parseError = new Error('Parsing failed');

    (getVideoById as Mock).mockResolvedValue(mockVideo);
    (parseM3U8Content as Mock).mockRejectedValue(parseError);

    await expect(fixDurationHandler(mockContext)).rejects.toThrow(
      'Fix duration failed',
    );

    expect(CustomError.medium).toHaveBeenCalledWith('Fix duration failed', {
      originalError: parseError,
      errorCode: VIDEO_ERRORS.FIX_DURATION_ERROR,
      context: {
        id: 'video-123',
        taskId: 'task-456',
      },
      source: 'apps/io/videos/routes/fix-duration/index.ts',
    });
  });

  it('should handle errors during the fix mutation', async () => {
    const mockVideo = {
      id: 'video-123',
      source: 'video-source',
    };
    const mutationError = new Error('Mutation failed');

    (getVideoById as Mock).mockResolvedValue(mockVideo);
    (parseM3U8Content as Mock).mockResolvedValue({ duration: 120 });
    (fixVideoDuration as Mock).mockRejectedValue(mutationError);

    await expect(fixDurationHandler(mockContext)).rejects.toThrow(
      'Fix duration failed',
    );

    expect(CustomError.medium).toHaveBeenCalledWith('Fix duration failed', {
      originalError: mutationError,
      errorCode: VIDEO_ERRORS.FIX_DURATION_ERROR,
      context: {
        id: 'video-123',
        taskId: 'task-456',
      },
      source: 'apps/io/videos/routes/fix-duration/index.ts',
    });
  });
});
