import {
  TaskEntityType,
  TaskType,
} from 'src/services/hasura/mutations/tasks/constants';
import { createCloudTasks } from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { AppError, AppResponse } from 'src/utils/schema';
import { queues } from 'src/utils/systemConfig';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { repairFmp4 } from './index';

const mockVideo = {
  id: 'video-123',
  user_id: 'user-456',
  source: 'https://storage.googleapis.com/bucket/playlist.m3u8',
};

const mockGetVideoById = vi.fn();

vi.mock('src/services/hasura/queries/videos', () => ({
  getVideoById: (...args: unknown[]) => mockGetVideoById(...args),
}));

vi.mock('src/utils/schema', () => ({
  AppError: vi.fn((message) => ({ success: false, message })),
  AppResponse: vi.fn((success, message) => ({ success, message })),
}));

vi.mock('src/utils/cloud-task', () => ({
  createCloudTasks: vi.fn(),
}));

vi.mock('src/utils/logger', () => {
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { getCurrentLogger: vi.fn(() => mockLogger) };
});

vi.mock('src/utils/systemConfig', () => ({
  queues: { convertVideoQueue: 'convert-video' },
}));

describe('repairFmp4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(envConfig).computeServiceUrl = 'http://compute-service';
    vi.mocked(createCloudTasks).mockResolvedValue({ name: 'test-task' });
    mockGetVideoById.mockResolvedValue(mockVideo);
  });

  const buildContext = (
    overrides: Partial<{ videoId: string; userId: string }> = {},
  ) => ({
    validatedData: {
      videoId: overrides.videoId ?? 'video-123',
      userId: overrides.userId ?? 'user-456',
    },
  });

  it('should create a Cloud Task for compute repair handler', async () => {
    const result = await repairFmp4(buildContext() as any);

    expect(createCloudTasks).toHaveBeenCalledWith(
      expect.objectContaining({
        audience: 'http://compute-service',
        queue: 'convert-video',
        url: 'http://compute-service/videos/repair-fmp4-handler',
        entityId: 'video-123',
        entityType: TaskEntityType.VIDEO,
        type: TaskType.REPAIR_FMP4,
        payload: expect.objectContaining({
          data: { videoId: 'video-123', userId: 'user-456' },
          metadata: expect.objectContaining({
            id: expect.any(String),
            spanId: expect.any(String),
            traceId: expect.any(String),
          }),
        }),
      }),
    );
    expect(result).toEqual({ success: true, message: 'ok' });
  });

  it('should reject when video not found', async () => {
    mockGetVideoById.mockResolvedValue(null);

    const result = await repairFmp4(buildContext() as any);

    expect(result).toEqual({
      success: false,
      message: 'Video with ID video-123 not found',
    });
    expect(createCloudTasks).not.toHaveBeenCalled();
  });

  it('should reject when user does not own the video', async () => {
    const result = await repairFmp4(
      buildContext({ userId: 'wrong-user' }) as any,
    );

    expect(result).toEqual({
      success: false,
      message: 'You do not have permission to modify this video',
    });
    expect(createCloudTasks).not.toHaveBeenCalled();
  });

  it('should return error when compute service URL is missing', async () => {
    vi.mocked(envConfig).computeServiceUrl = '';

    const result = await repairFmp4(buildContext() as any);

    expect(result).toEqual({
      success: false,
      message: 'Missing compute service URL',
    });
  });

  it('should return error when Cloud Task creation fails', async () => {
    vi.mocked(createCloudTasks).mockRejectedValue(
      new Error('Task creation failed'),
    );

    const result = await repairFmp4(buildContext() as any);

    expect(result).toEqual({
      success: false,
      message: 'Failed to create repair task',
    });
  });
});
