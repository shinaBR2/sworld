import { TaskEntityType, TaskType } from 'src/database/models/task';
import { AppError, AppResponse } from 'src/utils/schema';
import { verifySignature } from 'src/services/videos/convert/validator';
import { createCloudTasks } from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { queues } from 'src/utils/systemConfig';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { streamToStorage } from './index';

vi.mock('src/utils/schema', () => ({
  AppError: vi.fn((message, details) => {
    const error = new Error(message);
    (error as any).details = details;
    return error;
  }),
  AppResponse: vi.fn((success, message, data) => ({ success, message, data })),
}));

vi.mock('src/utils/cloud-task', () => ({
  createCloudTasks: vi.fn(),
}));

vi.mock('src/services/videos/convert/validator', () => ({
  verifySignature: vi.fn(),
  validateMediaURL: vi.fn((url: string) => {
    // Mock implementation that returns platform and fileType based on URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { platform: 'youtube', fileType: null };
    }
    if (url.endsWith('.m3u8')) {
      return { platform: null, fileType: 'hls' };
    }
    if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi')) {
      return { platform: null, fileType: 'video' };
    }
    return { platform: null, fileType: null };
  }),
}));

vi.mock('src/utils/systemConfig', () => ({
  queues: {
    streamVideoQueue: 'stream-video',
    convertVideoQueue: 'convert-video',
  },
}));

describe('streamToStorage', () => {
  let mockValidatedData: any;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(envConfig).computeServiceUrl = 'http://test-compute-service';
    vi.mocked(envConfig).ioServiceUrl = 'http://test-io-service';
    vi.mocked(verifySignature).mockReturnValue(true);
    vi.mocked(createCloudTasks).mockResolvedValue({ taskId: 'test-task' });

    mockValidatedData = {
      signatureHeader: 'test-signature',
      event: {
        data: { id: 'test-video', videoUrl: 'https://example.com/video.mp4' },
        metadata: { id: 'test-event' },
      },
    };
  });

  const createMockData = (data: Record<string, unknown>) => ({
    signatureHeader: 'test-signature',
    event: {
      data: {
        id: 'test-video',
        videoUrl: 'https://example.com/video.mp4',
        ...data,
      },
      metadata: {
        id: 'test-event',
        span_id: 'test-span',
        trace_id: 'test-trace',
      },
    },
  });

  it('should create cloud task for HLS file type', async () => {
    const newData = createMockData({
      fileType: 'hls',
      video_url: 'https://example.com/stream.m3u8',
    });
    const result = await streamToStorage(newData);

    expect(createCloudTasks).toHaveBeenCalledWith({
      url: 'http://test-io-service/videos/stream-hls-handler',
      audience: 'http://test-io-service',
      queue: queues.streamVideoQueue,
      payload: newData.event,
      entityId: 'test-video',
      entityType: TaskEntityType.VIDEO,
      type: TaskType.STREAM_HLS,
    });

    expect(result).toEqual({
      success: true,
      message: 'ok',
    });
  });

  it('should create cloud task for video file type', async () => {
    const newData = createMockData({
      fileType: 'video',
      video_url: 'https://example.com/video.mp4',
    });
    await streamToStorage(newData);

    expect(createCloudTasks).toHaveBeenCalledWith({
      url: 'http://test-compute-service/videos/convert-handler',
      audience: 'http://test-compute-service',
      queue: queues.convertVideoQueue,
      payload: newData.event,
      entityId: 'test-video',
      entityType: TaskEntityType.VIDEO,
      type: TaskType.CONVERT,
    });
  });

  it('should create cloud task for platform import', async () => {
    const newData = createMockData({
      platform: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    await streamToStorage(newData);

    expect(createCloudTasks).toHaveBeenCalledWith({
      url: 'http://test-io-service/videos/import-platform-handler',
      audience: 'http://test-io-service',
      queue: queues.streamVideoQueue,
      payload: newData.event,
      entityId: 'test-video',
      entityType: TaskEntityType.VIDEO,
      type: TaskType.IMPORT_PLATFORM,
    });
  });

  it('should return invalid source error when no valid file type or platform', async () => {
    const newData = createMockData({
      someOtherFields: 'value',
      video_url: 'https://example.com/video.unsupported',
    });
    const result = await streamToStorage(newData);

    expect(result).toEqual(AppError('Invalid source'));
    expect(createCloudTasks).not.toHaveBeenCalled();
  });

  it('should return invalid source error for unsupported file type', async () => {
    const newData = createMockData({
      fileType: 'invalid',
      video_url: 'https://example.com/video.unsupported',
    });
    const result = await streamToStorage(newData);

    expect(result).toEqual(AppError('Invalid source'));
  });

  it('should return invalid source error for unsupported platform', async () => {
    const newData = createMockData({
      platform: 'invalid',
      video_url: 'https://example.com/video.unsupported',
    });
    const result = await streamToStorage(newData);

    expect(result).toEqual(AppError('Invalid source'));
  });

  it('should throw error when compute service URL is missing', async () => {
    const mockEnvConfig = vi.mocked(envConfig);
    mockEnvConfig.computeServiceUrl = undefined;

    const testData = createMockData({
      video_url: 'https://example.com/video.mp4',
    });
    const result = await streamToStorage(testData);

    expect(result).toEqual(
      AppError('Missing environment variable', {
        eventId: 'test-event',
      }),
    );
    expect(createCloudTasks).not.toHaveBeenCalled();
  });

  it('should handle cloud task creation failure', async () => {
    const error = new Error('Task creation failed');
    vi.mocked(createCloudTasks).mockRejectedValue(error);

    const result = await streamToStorage(
      createMockData({
        fileType: 'video',
        video_url: 'https://example.com/video.mp4',
      }),
    );
    expect(result).toEqual(
      AppError('Failed to create task', {
        error,
        eventId: 'test-event',
      }),
    );
  });

  it('should skip processing when skipProcess is true', async () => {
    const result = await streamToStorage(
      createMockData({
        skip_process: true,
        video_url: 'https://example.com/video.mp4',
      }),
    );

    expect(createCloudTasks).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: 'ok',
    });
  });
});
