import { describe, it, expect } from 'vitest';
import { generateVideoDetailRoute } from './index';
import { MEDIA_TYPES, TransformedMediaItem } from '../query-hooks';

describe('generateVideoDetailRoute', () => {
  it('should return video route for video type', () => {
    const video = {
      id: '123',
      type: MEDIA_TYPES.VIDEO,
      title: 'Test Video',
      slug: 'test-video',
    } as TransformedMediaItem;

    expect(generateVideoDetailRoute(video)).toEqual({
      to: '/video/$slug-$id',
      params: {
        slug: 'test-video',
        id: '123',
      },
    });
  });

  it('should return playlist route for playlist type', () => {
    const video = {
      id: '123',
      type: MEDIA_TYPES.PLAYLIST,
      title: 'Test Playlist',
      slug: 'test-playlist',
    } as TransformedMediaItem;

    expect(generateVideoDetailRoute(video)).toEqual({
      to: '/playlist/$slug-$id',
      params: {
        slug: 'test-playlist',
        id: '123',
      },
    });
  });

  it('should return empty route for unknown type', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const video = {
      id: '123',
      type: 'unknown',
      title: 'Test Unknown',
    } as TransformedMediaItem;

    expect(generateVideoDetailRoute(video)).toEqual({
      to: '',
      params: {},
    });
  });
});
