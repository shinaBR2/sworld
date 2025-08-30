import { describe, expect, it } from 'vitest';
import type { FragmentType } from '../../graphql';
import { AppError } from '../../universal/error-boundary/app-error';
import type {
  PlaylistFragment,
  UserFragment,
  VideoFragment,
} from './fragments';
import {
  transformPlaylistFragment,
  transformUser,
  transformVideoFragment,
} from './transformers';
import { MEDIA_TYPES } from './types';

describe('Fragment Transformations', () => {
  describe('transformUser', () => {
    it('should transform user correctly', () => {
      const mockUserData = {
        username: 'testuser',
      };
      const result = transformUser(
        mockUserData as FragmentType<typeof UserFragment>,
      );
      expect(result).toEqual({
        username: 'testuser',
      });
    });
  });

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
      subtitles: [
        {
          id: '1',
          lang: 'en',
          url: 'test.vtt',
          isDefault: true,
        },
        {
          // Add multiple language cases
          id: '2',
          lang: 'vi',
          url: 'test-vi.vtt',
          isDefault: false,
        },
      ],
      user_video_histories: [
        {
          last_watched_at: '2023-02-01T00:00:00Z',
          progress_seconds: 50,
        },
      ],
    };

    it('should transform video fragment correctly', () => {
      const result = transformVideoFragment(
        mockVideoData as FragmentType<typeof VideoFragment>,
      );

      // Update subtitle expectations
      expect(result.subtitles).toEqual([
        {
          id: '1',
          lang: 'en',
          src: 'test.vtt',
          isDefault: true,
          label: 'English', // Changed from Vietnamese
        },
        {
          id: '2',
          lang: 'vi',
          src: 'test-vi.vtt',
          isDefault: false,
          label: 'Vietnamese',
        },
      ]);
    });

    // Rename and update this test
    it('should translate language codes to names', () => {
      const result = transformVideoFragment(
        mockVideoData as FragmentType<typeof VideoFragment>,
      );
      expect(result.subtitles.map((s) => s.label)).toEqual([
        'English',
        'Vietnamese',
      ]);
    });

    it('should throw AppError when source is missing', () => {
      const invalidVideoData = {
        ...mockVideoData,
        source: undefined,
      } as FragmentType<typeof VideoFragment>;

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
      const result = transformPlaylistFragment(
        mockPlaylistData as FragmentType<typeof PlaylistFragment>,
      );

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

      // @ts-expect-error
      expect(() => transformPlaylistFragment(invalidPlaylistData)).toThrow(
        AppError,
      );
    });
  });
});
