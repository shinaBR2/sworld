import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixVideosThumbnail } from './index';
import { getVideoMissingThumbnail } from 'src/database/queries/videos';
import { createCloudTasks } from 'src/utils/cloud-task';
import { verifySignature } from 'src/services/videos/convert/validator';
import { envConfig } from 'src/utils/envConfig';
import { queues } from 'src/utils/systemConfig';
import { AppError } from 'src/utils/schema';
import { TaskEntityType, TaskType } from 'src/database/models/task';

// Mock dependencies
vi.mock('src/database/queries/videos');
vi.mock('src/utils/cloud-task');
vi.mock('src/services/videos/convert/validator');
vi.mock('src/utils/logger');

describe('fixVideosThumbnail', () => {
  const mockVideos = [{ id: 'video1' }, { id: 'video2' }, { id: 'video3' }];

  const mockRequest = {
    validatedData: {
      signatureHeader: 'valid-signature',
    },
  } as any;

  const mockResponse = {
    json: vi.fn(),
  } as any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(verifySignature).mockReturnValue(true);
    vi.mocked(getVideoMissingThumbnail).mockResolvedValue(mockVideos);
    vi.mocked(createCloudTasks).mockResolvedValue(undefined);

    // Setup environment config
    envConfig.ioServiceUrl = 'http://test-service.com';
  });

  it('should create cloud tasks for videos without thumbnail', async () => {
    await fixVideosThumbnail(mockRequest, mockResponse);

    // Verify signature was checked
    expect(verifySignature).toHaveBeenCalledWith('valid-signature');

    // Verify videos were fetched
    expect(getVideoMissingThumbnail).toHaveBeenCalled();

    // Verify cloud tasks were created for each video
    expect(createCloudTasks).toHaveBeenCalledTimes(3);

    // Check task configuration for each video
    mockVideos.forEach((video, index) => {
      expect(createCloudTasks).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({
          audience: 'http://test-service.com',
          queue: queues.streamVideoQueue,
          entityId: video.id,
          entityType: TaskEntityType.VIDEO,
          type: TaskType.FIX_THUMBNAIL,
          url: 'http://test-service.com/videos/fix-thumbnail',
          payload: {
            id: video.id,
          },
        }),
      );
    });

    // Verify response was sent
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'ok',
    });
  });

  it('should handle invalid signature', async () => {
    vi.mocked(verifySignature).mockReturnValue(false);

    await fixVideosThumbnail(mockRequest, mockResponse);

    // Verify no tasks were created
    expect(createCloudTasks).not.toHaveBeenCalled();

    // Verify error response
    expect(mockResponse.json).toHaveBeenCalledWith(
      AppError('Invalid webhook signature for event'),
    );
  });

  it('should handle missing environment variable', async () => {
    envConfig.ioServiceUrl = '';

    await fixVideosThumbnail(mockRequest, mockResponse);

    // Verify no tasks were created
    expect(createCloudTasks).not.toHaveBeenCalled();

    // Verify error response
    expect(mockResponse.json).toHaveBeenCalledWith(
      AppError('Missing environment variable'),
    );
  });

  it('should handle task creation failure', async () => {
    vi.mocked(createCloudTasks).mockRejectedValue(
      new Error('Task creation failed'),
    );

    await fixVideosThumbnail(mockRequest, mockResponse);

    // Verify error response
    expect(mockResponse.json).toHaveBeenCalledWith(
      AppError('Failed to create task'),
    );
  });
});
