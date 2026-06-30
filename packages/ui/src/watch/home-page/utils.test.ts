import { AppError } from 'core/universal';
import {
  MEDIA_TYPES,
  type TransformedPlaylist,
  type TransformedVideo,
} from 'core/watch/query-hooks';
import { describe, expect, it, vi } from 'vitest';
import { filterByTitle, genlinkProps } from './utils';

// Mock the route generation functions
vi.mock('core/watch/routes', () => ({
  generateVideoDetailRoute: vi.fn().mockReturnValue({ to: '/video/123' }),
  generateVideoInPlaylistRoute: vi
    .fn()
    .mockReturnValue({ to: '/playlist/456' }),
}));

describe('genlinkProps', () => {
  it('should generate video route for video type', () => {
    const video = {
      type: MEDIA_TYPES.VIDEO,
      id: '123',
      title: 'Test Video',
    } as TransformedVideo;

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

    // @ts-expect-error
    expect(() => genlinkProps(invalidMedia)).toThrow(AppError);
    // @ts-expect-error
    expect(() => genlinkProps(invalidMedia)).toThrow('Invalid media type');
  });
});

describe('filterByTitle', () => {
  const items = [
    { title: 'React Basics' },
    { title: 'Advanced React' },
    { title: 'Vue Intro' },
  ];

  it('matches titles case-insensitively as a substring', () => {
    expect(filterByTitle(items, 'react')).toEqual([
      { title: 'React Basics' },
      { title: 'Advanced React' },
    ]);
    expect(filterByTitle(items, 'VUE')).toEqual([{ title: 'Vue Intro' }]);
  });

  it('returns the full list for an empty or whitespace-only query', () => {
    expect(filterByTitle(items, '')).toBe(items);
    expect(filterByTitle(items, '   ')).toBe(items);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterByTitle(items, 'svelte')).toEqual([]);
  });

  it('trims surrounding whitespace in the query', () => {
    expect(filterByTitle(items, '  vue  ')).toEqual([{ title: 'Vue Intro' }]);
  });
});
