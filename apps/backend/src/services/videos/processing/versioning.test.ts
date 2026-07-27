import { describe, expect, it } from 'vitest';
import { nextVersionDir } from './versioning';

describe('nextVersionDir', () => {
  it('returns v1 when no version directory exists yet', () => {
    expect(nextVersionDir(['playlist.m3u8', 'init.mp4', '0.m4s'])).toBe('v1');
  });

  it('returns v1 for an empty base', () => {
    expect(nextVersionDir([])).toBe('v1');
  });

  it('returns the next version after the highest existing one', () => {
    expect(nextVersionDir(['playlist.m3u8', 'v1/init.mp4', 'v1/0.m4s'])).toBe(
      'v2',
    );
  });

  it('picks the max, not the count, when versions are non-contiguous', () => {
    expect(nextVersionDir(['v1/init.mp4', 'v3/init.mp4'])).toBe('v4');
  });

  it('handles double-digit versions numerically (not lexically)', () => {
    expect(nextVersionDir(['v9/init.mp4', 'v10/init.mp4'])).toBe('v11');
  });

  it('ignores names that merely start with v but are not version dirs', () => {
    expect(nextVersionDir(['video.mp4', 'v1beta/init.mp4', 'vtt.txt'])).toBe(
      'v1',
    );
  });
});
