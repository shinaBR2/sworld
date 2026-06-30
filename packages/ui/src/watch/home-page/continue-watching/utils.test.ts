import { describe, expect, it, vi } from 'vitest';
import type { ContinueWatchingItem } from './types';
import { genlinkProps } from './utils';

vi.mock('core/watch/routes', () => ({
  generateVideoDetailRoute: vi.fn().mockReturnValue({ to: '/video/123' }),
  generateVideoInPlaylistRoute: vi
    .fn()
    .mockReturnValue({ to: '/playlist/456' }),
}));

describe('continue-watching genlinkProps', () => {
  it('links a standalone video to the video detail route', () => {
    const item = {
      id: '123',
      slug: 'test-video',
    } as ContinueWatchingItem;

    const result = genlinkProps(item);
    expect(result).toEqual({ to: '/video/123' });
  });

  it('links a video watched inside a playlist to the in-playlist route', () => {
    const item = {
      id: '123',
      slug: 'test-video',
      playlist: {
        id: 'abc',
        slug: 'test-playlist',
      },
    } as ContinueWatchingItem;

    const result = genlinkProps(item);
    expect(result).toEqual({ to: '/playlist/456' });
  });
});
