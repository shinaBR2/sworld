import { describe, expect, it } from 'vitest';
import { formatDuration, getMediaDisplayName } from './utils';

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

describe('formatDuration', () => {
  it('formats sub-minute durations as 0:ss', () => {
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(45)).toBe('0:45');
  });

  it('formats minutes as m:ss', () => {
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(600)).toBe('10:00');
  });

  it('widens to h:mm:ss past an hour', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7200)).toBe('2:00:00');
  });

  it('floors fractional seconds', () => {
    expect(formatDuration(90.9)).toBe('1:30');
  });

  it('returns an empty string for missing / non-positive / non-finite values', () => {
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(-10)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('');
    expect(formatDuration(Number.NaN)).toBe('');
  });
});
