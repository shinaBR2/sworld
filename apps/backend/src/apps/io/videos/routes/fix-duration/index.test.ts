import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fixDurationHandler } from './index';
import { sequelize } from 'src/database';
import { completeTask } from 'src/database/queries/tasks';
import { getVideoById, updateVideoDuration } from 'src/database/queries/videos';
import { parseM3U8Content } from 'src/services/videos/helpers/m3u8/helpers';
import { logger } from 'src/utils/logger';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import type { HandlerContext } from 'src/utils/requestHandler';
import type { FixDurationHandlerRequest } from 'src/schema/videos/fix-duration';

// Mock dependencies
vi.mock('src/database', () => ({
  sequelize: {
    transaction: vi.fn(),
  },
}));

vi.mock('src/database/queries/tasks', () => ({
  completeTask: vi.fn(),
}));

vi.mock('src/database/queries/videos', () => ({
  getVideoById: vi.fn(),
  updateVideoDuration: vi.fn(),
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
    const mockTransaction = {
      commit: vi.fn(),
      rollback: vi.fn(),
    };

    (sequelize.transaction as Mock).mockResolvedValue(mockTransaction);
    (getVideoById as Mock).mockResolvedValue(mockVideo);
    (parseM3U8Content as Mock).mockResolvedValue({ duration: mockDuration });
    (updateVideoDuration as Mock).mockResolvedValue(1);
    (completeTask as Mock).mockResolvedValue(true);

    const result = await fixDurationHandler(mockContext);

    expect(getVideoById).toHaveBeenCalledWith('video-123');
    expect(parseM3U8Content).toHaveBeenCalledWith(
      'video-source',
      expect.any(Array),
    );
    expect(sequelize.transaction).toHaveBeenCalled();
    expect(updateVideoDuration).toHaveBeenCalledWith({
      id: 'video-123',
      duration: mockDuration,
      transaction: mockTransaction,
    });
    expect(completeTask).toHaveBeenCalledWith({ taskId: 'task-456' });
    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: 'ok',
      dataObject: { taskId: 'task-456' },
    });
  });

  it('should throw error when video is not found', async () => {
    const mockTransaction = {
      commit: vi.fn(),
      rollback: vi.fn(),
    };

    (sequelize.transaction as Mock).mockResolvedValue(mockTransaction);
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
    const mockTransaction = {
      commit: vi.fn(),
      rollback: vi.fn(),
    };

    (sequelize.transaction as Mock).mockResolvedValue(mockTransaction);
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

  it('should handle errors during task completion', async () => {
    const mockVideo = {
      id: 'video-123',
      source: 'video-source',
    };
    const taskError = new Error('Task completion failed');
    const mockTransaction = {
      commit: vi.fn(),
      rollback: vi.fn(),
    };

    (sequelize.transaction as Mock).mockResolvedValue(mockTransaction);
    (getVideoById as Mock).mockResolvedValue(mockVideo);
    (parseM3U8Content as Mock).mockResolvedValue({ duration: 120 });
    (updateVideoDuration as Mock).mockResolvedValue(1);
    (completeTask as Mock).mockRejectedValue(taskError);

    await expect(fixDurationHandler(mockContext)).rejects.toThrow(
      'Fix duration failed',
    );

    expect(CustomError.medium).toHaveBeenCalledWith('Fix duration failed', {
      originalError: taskError,
      errorCode: VIDEO_ERRORS.FIX_DURATION_ERROR,
      context: {
        id: 'video-123',
        taskId: 'task-456',
      },
      source: 'apps/io/videos/routes/fix-duration/index.ts',
    });

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });
});
