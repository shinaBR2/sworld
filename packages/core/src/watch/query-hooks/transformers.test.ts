import { describe, it, expect } from 'vitest';
import { transformVideoFragment, transformPlaylistFragment } from './transformers';
import { AppError } from '../../universal/error-boundary/app-error';
import { MEDIA_TYPES } from './types';

describe('Fragment Transformations', () => {
  describe('transformVideoFragment', () => {
    const mockVideoData = {
      id: '123',
      title: 'Test Video',
      description: 'Test Description',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      source: 'https://example.com/video.mp4',
      slug: 'test-video',
      duration: 100,
      createdAt: '2023-01-01T00:00:00Z',
      user: { username: 'testuser' },
      user_video_histories: [
        {
          last_watched_at: '2023-02-01T00:00:00Z',
          progress_seconds: 50,
        },
      ],
    };

    it('should transform video fragment correctly', () => {
      const result = transformVideoFragment(mockVideoData);

      expect(result).toEqual({
        id: '123',
        type: MEDIA_TYPES.VIDEO,
        title: 'Test Video',
        description: 'Test Description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        source: 'https://example.com/video.mp4',
        slug: 'test-video',
        duration: 100,
        createdAt: '2023-01-01T00:00:00Z',
        user: { username: 'testuser' },
        lastWatchedAt: '2023-02-01T00:00:00Z',
        progressSeconds: 50,
      });
    });

    it('should throw AppError when source is missing', () => {
      const invalidVideoData = { ...mockVideoData, source: undefined };

      expect(() => transformVideoFragment(invalidVideoData)).toThrow(AppError);
    });
  });

  describe('transformPlaylistFragment', () => {
    const mockPlaylistData = {
      id: '456',
      title: 'Test Playlist',
      thumbnailUrl: 'https://example.com/playlist-thumb.jpg',
      slug: 'test-playlist',
      createdAt: '2023-01-01T00:00:00Z',
      description: 'Test Playlist Description',
      user: { username: 'testuser' },
      playlist_videos: [
        {
          video: {
            id: 'video123',
            title: 'First Video',
          },
        },
      ],
    };

    it('should transform playlist fragment correctly', () => {
      const result = transformPlaylistFragment(mockPlaylistData as any);

      expect(result).toEqual({
        id: '456',
        type: MEDIA_TYPES.PLAYLIST,
        title: 'Test Playlist',
        thumbnailUrl: 'https://example.com/playlist-thumb.jpg',
        slug: 'test-playlist',
        createdAt: '2023-01-01T00:00:00Z',
        description: 'Test Playlist Description',
        user: { username: 'testuser' },
        firstVideoId: 'video123',
      });
    });

    it('should throw AppError when playlist has no videos', () => {
      const invalidPlaylistData = { ...mockPlaylistData, playlist_videos: [] };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(() => transformPlaylistFragment(invalidPlaylistData)).toThrow(AppError);
    });
  });
});
