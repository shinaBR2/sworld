import { nanoid } from 'nanoid';
import { describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../client';
import { finishVideoProcess } from './finalize';

vi.mock('../client', () => ({
  hasuraClient: {
    request: vi.fn(),
  },
}));

// Add nanoid mock at the top
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mocked-short-id'),
}));

describe('finishVideoProcess', () => {
  const mockVariables = {
    taskId: '123e4567-e89b-12d3-a456-426614174000',
    videoId: '987fcdeb-89ab-12d3-a456-426614174000',
    notificationObject: {
      userId: 'user-123',
      type: 'VIDEO_PROCESSED',
      title: 'Video Processing Complete',
      description: 'Your video has been processed successfully',
    },
    videoUpdates: {
      status: 'published',
      processedUrl: 'https://example.com/processed-video.mp4',
    },
  };

  it('should update task, insert notification, and update video successfully', async () => {
    const mockResponse = {
      update_tasks: {
        affected_rows: 1,
        returning: [
          {
            id: 1,
          },
        ],
      },
      insert_notifications_one: {
        id: 'notification-123',
      },
      update_videos_by_pk: {
        id: mockVariables.videoId,
      },
    };
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await finishVideoProcess(mockVariables);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation FinalizeVideo'),
      variables: {
        ...mockVariables,
        videoUpdates: {
          ...mockVariables.videoUpdates,
          sId: 'mocked-short-id',
        },
      },
    });
    expect(result).toBe('notification-123');
  });

  it('should return undefined when notification insert fails', async () => {
    const mockResponse = {
      update_tasks: {
        affected_rows: 1,
        returning: [
          {
            id: 1,
          },
        ],
      },
      insert_notifications_one: null,
      update_videos_by_pk: {
        id: mockVariables.videoId,
      },
    };
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await finishVideoProcess(mockVariables);

    expect(result).toBeUndefined();
  });

  it('should throw error when request fails', async () => {
    const error = new Error('Database error');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(error);

    await expect(finishVideoProcess(mockVariables)).rejects.toThrow('Database error');
  });

  // Add new test case for short ID generation
  it('should generate a short ID for videoUpdates', async () => {
    vi.mocked(nanoid).mockReturnValueOnce('test-id-123');
    const mockResponse = {
      update_tasks: {
        affected_rows: 1,
        returning: [
          {
            id: 1,
          },
        ],
      },
      insert_notifications_one: {
        id: 'notification-123',
      },
      update_videos_by_pk: {
        id: mockVariables.videoId,
      },
    };
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await finishVideoProcess(mockVariables);

    expect(nanoid).toHaveBeenCalledWith(11);
    expect(hasuraClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          videoUpdates: expect.objectContaining({
            sId: 'test-id-123',
          }),
        }),
      })
    );
  });
});
