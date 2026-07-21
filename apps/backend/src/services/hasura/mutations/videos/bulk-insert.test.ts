import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InsertVideosMutation } from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';
import { type VideoInput, insertVideos } from './bulk-insert';

// Mock GraphQL client
vi.mock('../../client', () => ({
  hasuraClient: {
    request: vi.fn(),
  },
}));

describe('insertVideos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockVideos: VideoInput[] = [
    {
      title: 'Test Video',
      slug: 'test-video',
      video_url: 'https://example.com/video.mp4',
      user_id: 'user123',
      description: 'Test description',
    },
  ];

  const mockResponse: InsertVideosMutation = {
    insert_videos: {
      returning: [
        {
          id: 'video123',
          title: 'Test Video',
          description: 'Test description',
        },
      ],
    },
  };

  it('should call hasuraClient.request with correct parameters', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    await insertVideos(mockVideos);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.any(String),
      variables: {
        objects: mockVideos,
      },
    });
  });

  it('should return insert_videos from the response', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await insertVideos(mockVideos);

    expect(result).toEqual(mockResponse.insert_videos);
  });

  it('should throw an error when hasuraClient.request fails', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(insertVideos(mockVideos)).rejects.toThrow(mockError);
  });
});
