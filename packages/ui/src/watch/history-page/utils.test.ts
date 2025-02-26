import { describe, it, expect, vi } from 'vitest';
import { genlinkProps } from './utils';
import { HistoryVideo } from './types';

// Mock the route generation functions
vi.mock('core/watch/routes', () => ({
  generateVideoDetailRoute: vi.fn().mockReturnValue({ to: '/video/123' }),
  generateVideoInPlaylistRoute: vi.fn().mockReturnValue({ to: '/playlist/456' }),
}));

describe('genlinkProps', () => {
  it('should generate video route for standalone video', () => {
    const video = {
      id: '123',
      slug: 'test-video',
    } as HistoryVideo;

    const result = genlinkProps(video);
    expect(result).toEqual({ to: '/video/123' });
  });

  it('should generate video route in playlist', () => {
    const playlist = {
      id: '456',
      slug: 'test-video',
      playlist: {
        id: 'abc',
        slug: 'test-playlist',
      },
    } as HistoryVideo;

    const result = genlinkProps(playlist);
    expect(result).toEqual({ to: '/playlist/456' });
  });
});
