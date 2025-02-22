import { describe, it, expect } from 'vitest';
import { generateVideoDetailRoute } from './routes';
import { MEDIA_TYPES, TransformedMediaItem } from './query-hooks';

describe('generateVideoDetailRoute', () => {
  it('should return video route for video type', () => {
    const video = {
      id: '123',
      type: MEDIA_TYPES.VIDEO,
      title: 'Test Video',
    } as TransformedMediaItem;

    expect(generateVideoDetailRoute(video)).toBe('/$videoId');
  });

  it('should return playlist route for playlist type', () => {
    const video = {
      id: '123',
      type: MEDIA_TYPES.PLAYLIST,
      title: 'Test Playlist',
    } as TransformedMediaItem;

    expect(generateVideoDetailRoute(video)).toBe('/$playlistId');
  });

  it('should return empty string for unknown type', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const video = {
      id: '123',
      type: 'unknown',
      title: 'Test Unknown',
    } as TransformedMediaItem;

    expect(generateVideoDetailRoute(video)).toBe('');
  });
});
