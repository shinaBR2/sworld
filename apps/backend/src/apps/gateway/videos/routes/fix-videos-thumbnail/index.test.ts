import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixVideosThumbnail } from './index';
import { getVideoMissingThumbnail } from 'src/database/queries/videos';
import { createCloudTasks } from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { queues } from 'src/utils/systemConfig';
import { AppError } from 'src/utils/schema';
import { TaskEntityType, TaskType } from 'src/database/models/task';

// Mock dependencies
vi.mock('src/database/queries/videos');
vi.mock('src/utils/cloud-task');
vi.mock('src/utils/logger');

describe('fixVideosThumbnail', () => {
  const mockVideos = [{ id: 'video1' }, { id: 'video2' }, { id: 'video3' }];

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(getVideoMissingThumbnail).mockResolvedValue(mockVideos);
    vi.mocked(createCloudTasks).mockResolvedValue(undefined);

    // Setup environment config
    envConfig.ioServiceUrl = 'http://test-service.com';
  });

  it('should create cloud tasks for videos without thumbnail', async () => {
    const result = await fixVideosThumbnail();

    // Verify videos were fetched
    expect(getVideoMissingThumbnail).toHaveBeenCalled();

    // Verify cloud tasks were created for each video
    expect(createCloudTasks).toHaveBeenCalledTimes(3);

    // Check task configuration for each video
    mockVideos.forEach((video) => {
      expect(createCloudTasks).toHaveBeenCalledWith(
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
    expect(result).toEqual({
      success: true,
      message: 'ok',
    });
  });

  it('should handle missing environment variable', async () => {
    envConfig.ioServiceUrl = '';

    const result = await fixVideosThumbnail();

    // Verify no tasks were created
    expect(createCloudTasks).not.toHaveBeenCalled();

    // Verify error response
    expect(result).toEqual(AppError('Missing environment variable'));
  });

  it('should handle task creation failure', async () => {
    vi.mocked(createCloudTasks).mockRejectedValue(
      new Error('Task creation failed'),
    );

    const result = await fixVideosThumbnail();

    // Verify error response
    expect(result).toEqual(AppError('Failed to create task'));
  });
});
