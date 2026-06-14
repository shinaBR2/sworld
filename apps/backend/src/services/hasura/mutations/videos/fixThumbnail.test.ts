import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../../client';
import { fixVideoThumbnail } from './fixThumbnail';

vi.mock('../../client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: {
      request: mockRequest,
    },
  };
});

const params = {
  id: 'video-1',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  taskId: 'task-1',
};

describe('fixVideoThumbnail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the thumbnail and completes the task in one mutation', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_videos_by_pk: { id: 'video-1' },
      update_tasks: { affected_rows: 1 },
    });

    await fixVideoThumbnail(params);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation FixVideoThumbnail'),
      variables: params,
    });
  });

  it('throws when the video was not found', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_videos_by_pk: null,
      update_tasks: { affected_rows: 1 },
    });

    await expect(fixVideoThumbnail(params)).rejects.toThrow(
      'Video with ID video-1 not found',
    );
  });

  it('throws when the task was not found', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_videos_by_pk: { id: 'video-1' },
      update_tasks: { affected_rows: 0 },
    });

    await expect(fixVideoThumbnail(params)).rejects.toThrow(
      'Task with ID task-1 not found',
    );
  });
});
