import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../../client';
import { setVideoThumbnail } from './setThumbnail';

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
};

describe('setVideoThumbnail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the thumbnail and returns the updated video', async () => {
    const updated = { id: 'video-1', thumbnailUrl: params.thumbnailUrl };
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_videos_by_pk: updated,
    });

    const result = await setVideoThumbnail(params);

    expect(result).toEqual(updated);
    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation SetVideoThumbnail'),
      variables: params,
    });
  });

  it('throws when the video was not found', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_videos_by_pk: null,
    });

    await expect(setVideoThumbnail(params)).rejects.toThrow(
      'Video with ID video-1 not found',
    );
  });
});
