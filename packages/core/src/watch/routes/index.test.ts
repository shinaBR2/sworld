import { describe, it, expect } from 'vitest';
import { generateVideoDetailRoute, generateVideoInPlaylistRoute } from './index';

describe('generateVideoDetailRoute', () => {
  it('should return video route', () => {
    const props = {
      id: '123',
      slug: 'test-video',
    };

    expect(generateVideoDetailRoute(props)).toEqual({
      to: '/video/$slug/$id',
      params: {
        slug: 'test-video',
        id: '123',
      },
    });
  });
});

describe('generateVideoInPlaylistRoute', () => {
  it('should return video route for video in a playlist', () => {
    const props = {
      playlistId: 'playlist-abc',
      playlistSlug: 'playlist-slug',
      videoId: 'video-123',
    };

    expect(generateVideoInPlaylistRoute(props)).toEqual({
      to: '/playlist/$slug/$playlistId/$videoId',
      params: {
        slug: 'playlist-slug',
        playlistId: 'playlist-abc',
        videoId: 'video-123',
      },
    });
  });
});
