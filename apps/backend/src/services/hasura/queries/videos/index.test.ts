import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../../client';
import {
  getVideoById,
  getVideoMissingDuration,
  getVideoMissingThumbnail,
} from './index';

vi.mock('../../client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: {
      request: mockRequest,
    },
  };
});

describe('getVideoById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const id = 'video-1';
  const video = {
    id,
    source: 'https://example.com/index.m3u8',
    status: 'ready',
    user_id: 'user-1',
    duration: 120,
    thumbnailUrl: 'https://example.com/thumb.jpg',
  };

  it('requests videos_by_pk with the id', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      videos_by_pk: video,
    });

    await getVideoById(id);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('query GetVideoById'),
      variables: { id },
    });
  });

  it('returns videos_by_pk from the response', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      videos_by_pk: video,
    });

    const result = await getVideoById(id);

    expect(result).toEqual(video);
  });

  it('returns null when the video is not found', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      videos_by_pk: null,
    });

    const result = await getVideoById(id);

    expect(result).toBeNull();
  });

  it('throws when the request fails', async () => {
    const error = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(error);

    await expect(getVideoById(id)).rejects.toThrow(error);
  });
});

describe('getVideoMissingDuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the missing-duration query and returns the videos', async () => {
    const videos = [{ id: 'a' }, { id: 'b' }];
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({ videos });

    const result = await getVideoMissingDuration();

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('query GetVideosMissingDuration'),
    });
    expect(result).toEqual(videos);
  });
});

describe('getVideoMissingThumbnail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the missing-thumbnail query and returns the videos', async () => {
    const videos = [{ id: 'a' }];
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({ videos });

    const result = await getVideoMissingThumbnail();

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('query GetVideosMissingThumbnail'),
    });
    expect(result).toEqual(videos);
  });
});
