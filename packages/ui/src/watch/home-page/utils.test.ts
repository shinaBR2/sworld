import { describe, it, expect, vi } from 'vitest';
import { AppError } from 'core/universal';
import { MEDIA_TYPES, TransformedMediaItem, TransformedPlaylist } from 'core/watch/query-hooks/videos';
import { genlinkProps } from './utils';

// Mock the route generation functions
vi.mock('core/watch/routes', () => ({
  generateVideoDetailRoute: vi.fn().mockReturnValue({ to: '/video/123' }),
  generatePlaylistDetailRoute: vi.fn().mockReturnValue({ to: '/playlist/456' }),
}));

describe('genlinkProps', () => {
  it('should generate video route for video type', () => {
    const video = {
      type: MEDIA_TYPES.VIDEO,
      id: '123',
      title: 'Test Video',
    } as TransformedMediaItem;

    const result = genlinkProps(video);
    expect(result).toEqual({ to: '/video/123' });
  });

  it('should generate playlist route for playlist type', () => {
    const playlist = {
      type: MEDIA_TYPES.PLAYLIST,
      id: '456',
      title: 'Test Playlist',
    } as TransformedPlaylist;

    const result = genlinkProps(playlist);
    expect(result).toEqual({ to: '/playlist/456' });
  });

  it('should throw AppError for invalid media type', () => {
    const invalidMedia = {
      type: 'INVALID_TYPE',
      id: '789',
      title: 'Invalid Media',
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => genlinkProps(invalidMedia)).toThrow(AppError);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => genlinkProps(invalidMedia)).toThrow('Invalid media type');
  });
});
