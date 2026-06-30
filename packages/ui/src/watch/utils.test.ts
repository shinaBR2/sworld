import { describe, expect, it } from 'vitest';
import { getMediaDisplayName } from './utils';

describe('getMediaDisplayName', () => {
  it('returns the video title alone for a standalone video', () => {
    expect(getMediaDisplayName({ videoTitle: 'My Video' })).toBe('My Video');
  });

  it('prefixes the playlist name when the video belongs to a playlist', () => {
    expect(
      getMediaDisplayName({
        videoTitle: 'Episode 1',
        playlistName: 'My Playlist',
      }),
    ).toBe('My Playlist - Episode 1');
  });

  it('falls back to the video title when the playlist name is empty or null', () => {
    expect(
      getMediaDisplayName({ videoTitle: 'My Video', playlistName: '' }),
    ).toBe('My Video');
    expect(
      getMediaDisplayName({ videoTitle: 'My Video', playlistName: null }),
    ).toBe('My Video');
  });
});
