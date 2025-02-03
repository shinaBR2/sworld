import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { envConfig } from 'src/utils/envConfig';
import { createCloudTasks } from 'src/utils/cloud-task';
import { verifySignature } from 'src/services/videos/convert/validator';
import { streamToStorage } from './index';
import { queues } from 'src/utils/systemConfig';
import { TaskEntityType, TaskType } from 'src/database/models/task';

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
}));

vi.mock('src/utils/systemConfig', () => ({
  queues: {
    streamVideoQueue: 'stream-video',
    convertVideoQueue: 'convert-video',
  },
}));

describe('streamToStorage', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(envConfig).computeServiceUrl = 'http://test-compute-service';
    vi.mocked(envConfig).ioServiceUrl = 'http://test-io-service';
    vi.mocked(verifySignature).mockReturnValue(true);
    vi.mocked(createCloudTasks).mockResolvedValue({ taskId: 'test-task' });

    mockReq = {
      validatedData: {
        signatureHeader: 'test-signature',
        event: {
          data: { id: 'test-video' },
          metadata: { id: 'test-event' },
        },
      },
    };

    mockRes = {
      json: vi.fn().mockReturnThis(),
    };
  });

  const createMockRequest = (data: Record<string, unknown>) => ({
    ...mockReq,
    validatedData: {
      ...mockReq.validatedData,
      event: {
        ...mockReq.validatedData.event,
        data: { ...mockReq.validatedData.event.data, ...data },
      },
    },
  });

  it('should create cloud task for HLS file type', async () => {
    const hlsReq = createMockRequest({ fileType: 'hls' });

    await streamToStorage(hlsReq, mockRes as Response);

    expect(createCloudTasks).toHaveBeenCalledWith({
      url: 'http://test-io-service/videos/stream-hls-handler',
      queue: queues.streamVideoQueue,
      payload: hlsReq.validatedData.event,
      entityId: 'test-video',
      entityType: TaskEntityType.VIDEO,
      type: TaskType.STREAM_HLS,
    });

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'ok',
      })
    );
  });

  it('should create cloud task for video file type', async () => {
    const videoReq = createMockRequest({ fileType: 'video' });

    await streamToStorage(videoReq, mockRes as Response);

    expect(createCloudTasks).toHaveBeenCalledWith({
      url: 'http://test-compute-service/videos/convert-handler',
      queue: queues.convertVideoQueue,
      payload: videoReq.validatedData.event,
      entityId: 'test-video',
      entityType: TaskEntityType.VIDEO,
      type: TaskType.CONVERT,
    });
  });

  it('should create cloud task for platform import', async () => {
    const platformReq = createMockRequest({ platform: 'youtube' });

    await streamToStorage(platformReq, mockRes as Response);

    expect(createCloudTasks).toHaveBeenCalledWith({
      url: 'http://test-io-service/videos/import-platform-handler',
      queue: queues.streamVideoQueue,
      payload: platformReq.validatedData.event,
      entityId: 'test-video',
      entityType: TaskEntityType.VIDEO,
      type: TaskType.IMPORT_PLATFORM,
    });
  });

  it('should return invalid source error when no valid file type or platform', async () => {
    const invalidReq = createMockRequest({ someOtherField: 'value' });

    await streamToStorage(invalidReq, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid source',
      })
    );
    expect(createCloudTasks).not.toHaveBeenCalled();
  });

  it('should return invalid source error for unsupported file type', async () => {
    const invalidReq = createMockRequest({ fileType: 'unsupported' });

    await streamToStorage(invalidReq, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid source',
      })
    );
  });

  it('should return invalid source error for unsupported platform', async () => {
    const invalidReq = createMockRequest({ platform: 'unsupported' });

    await streamToStorage(invalidReq, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid source',
      })
    );
  });

  it('should throw error when signature is invalid', async () => {
    vi.mocked(verifySignature).mockReturnValue(false);

    await streamToStorage(mockReq, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid webhook signature for event',
        details: {
          eventId: 'test-event',
        },
      })
    );
    expect(createCloudTasks).not.toHaveBeenCalled();
  });

  it('should throw error when compute service URL is missing', async () => {
    const mockEnvConfig = vi.mocked(envConfig);
    mockEnvConfig.computeServiceUrl = undefined;

    await streamToStorage(mockReq, mockRes as Response);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Missing environment variable',
        details: {
          eventId: 'test-event',
        },
      })
    );
    expect(createCloudTasks).not.toHaveBeenCalled();
  });

  it('should handle cloud task creation failure', async () => {
    const error = new Error('Task creation failed');
    vi.mocked(createCloudTasks).mockRejectedValue(error);

    const videoReq = createMockRequest({ fileType: 'video' });

    await streamToStorage(videoReq, mockRes as Response);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Failed to create task',
        details: {
          error,
          eventId: 'test-event',
        },
      })
    );
  });
});
