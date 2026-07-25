import { describe, expect, it } from 'vitest';
import type { FragmentType } from '../../graphql';
import { AppError } from '../../universal/error-boundary/app-error';
import type { AlbumFragment, PhotoFragment } from './fragments';
import { transformAlbumFragment, transformPhotoFragment } from './transformers';

describe('Look fragment transformations', () => {
  describe('transformPhotoFragment', () => {
    const mockPhotoData = {
      id: 'photo-123',
      type: 'image',
      source: 'https://example.com/photo.jpg',
      mediumUrl: 'https://example.com/photo-medium.jpg',
      thumbnailUrl: 'https://example.com/photo-thumb.jpg',
      blurHash: 'LEHV6nWB2yk8pyo',
      width: 1920,
      height: 1080,
      duration: null,
      takenAt: '2023-01-01T00:00:00Z',
      slug: 'test-photo',
    };

    it('should transform photo fragment correctly', () => {
      const result = transformPhotoFragment(
        mockPhotoData as FragmentType<typeof PhotoFragment>,
      );

      expect(result).toEqual({
        id: 'photo-123',
        type: 'image',
        source: 'https://example.com/photo.jpg',
        mediumUrl: 'https://example.com/photo-medium.jpg',
        thumbnailUrl: 'https://example.com/photo-thumb.jpg',
        blurHash: 'LEHV6nWB2yk8pyo',
        width: 1920,
        height: 1080,
        duration: null,
        takenAt: '2023-01-01T00:00:00Z',
        slug: 'test-photo',
      });
    });

    it('should transform a video fragment with its duration', () => {
      const videoData = {
        ...mockPhotoData,
        type: 'video',
        source: 'https://example.com/video/playlist.m3u8',
        duration: 42,
      };

      const result = transformPhotoFragment(
        videoData as FragmentType<typeof PhotoFragment>,
      );

      expect(result.type).toBe('video');
      expect(result.source).toBe('https://example.com/video/playlist.m3u8');
      expect(result.duration).toBe(42);
    });

    it('should throw AppError when thumbnailUrl is missing', () => {
      const invalidPhotoData = {
        ...mockPhotoData,
        thumbnailUrl: null,
      } as unknown as FragmentType<typeof PhotoFragment>;

      expect(() => transformPhotoFragment(invalidPhotoData)).toThrow(AppError);
    });
  });

  describe('transformAlbumFragment', () => {
    const mockAlbumData = {
      id: 'album-456',
      title: 'Test Album',
      thumbnailUrl: 'https://example.com/album-thumb.jpg',
      slug: 'test-album',
      createdAt: '2023-01-01T00:00:00Z',
      description: 'Test Album Description',
      playlist_photos: [
        {
          position: 0,
          photo: {
            id: 'photo-123',
            type: 'image',
            source: 'https://example.com/photo.jpg',
            mediumUrl: 'https://example.com/photo-medium.jpg',
            thumbnailUrl: 'https://example.com/photo-thumb.jpg',
            blurHash: 'LEHV6nWB2yk8pyo',
            width: 1920,
            height: 1080,
            duration: null,
            takenAt: '2023-01-01T00:00:00Z',
            slug: 'test-photo',
          },
        },
      ],
    };

    it('should transform album fragment correctly', () => {
      const result = transformAlbumFragment(
        mockAlbumData as unknown as FragmentType<typeof AlbumFragment>,
      );

      expect(result).toEqual({
        id: 'album-456',
        title: 'Test Album',
        thumbnailUrl: 'https://example.com/album-thumb.jpg',
        slug: 'test-album',
        createdAt: '2023-01-01T00:00:00Z',
        description: 'Test Album Description',
        photos: [
          {
            id: 'photo-123',
            type: 'image',
            source: 'https://example.com/photo.jpg',
            mediumUrl: 'https://example.com/photo-medium.jpg',
            thumbnailUrl: 'https://example.com/photo-thumb.jpg',
            blurHash: 'LEHV6nWB2yk8pyo',
            width: 1920,
            height: 1080,
            duration: null,
            takenAt: '2023-01-01T00:00:00Z',
            slug: 'test-photo',
          },
        ],
      });
    });

    it('should return an empty photos array for an album with no photos', () => {
      const emptyAlbumData = {
        ...mockAlbumData,
        playlist_photos: [],
      };

      const result = transformAlbumFragment(
        emptyAlbumData as unknown as FragmentType<typeof AlbumFragment>,
      );

      expect(result.photos).toEqual([]);
    });
  });
});
