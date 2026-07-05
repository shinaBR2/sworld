import { describe, expect, it } from 'vitest';
import { isVideoFinished, VIDEO_FINISHED_END_THRESHOLD_SECONDS } from './utils';

describe('isVideoFinished', () => {
  it('mirrors the player end threshold of 10 seconds', () => {
    expect(VIDEO_FINISHED_END_THRESHOLD_SECONDS).toBe(10);
  });

  it('is not finished just before the end threshold', () => {
    // duration - 10 = 110, progress below that is still partway through
    expect(isVideoFinished({ progressSeconds: 109, duration: 120 })).toBe(
      false,
    );
  });

  it('is finished exactly at the end threshold', () => {
    expect(isVideoFinished({ progressSeconds: 110, duration: 120 })).toBe(true);
  });

  it('is finished past the end threshold', () => {
    expect(isVideoFinished({ progressSeconds: 118, duration: 120 })).toBe(true);
  });

  it('is not finished when duration is unknown (0)', () => {
    expect(isVideoFinished({ progressSeconds: 500, duration: 0 })).toBe(false);
  });

  it('is not finished at the very start', () => {
    expect(isVideoFinished({ progressSeconds: 0, duration: 120 })).toBe(false);
  });

  it('does not flag a barely-watched short clip as finished', () => {
    // For an 8s clip a flat 10s window would make `duration - threshold`
    // negative, wrongly hiding a clip the user only just started.
    expect(isVideoFinished({ progressSeconds: 2, duration: 8 })).toBe(false);
  });

  it('does not flag a short clip as finished at its midpoint', () => {
    // A 20s clip watched to 0:10 still has half its runtime left — the end
    // window caps at the final 10% (2s), so this is not finished.
    expect(isVideoFinished({ progressSeconds: 10, duration: 20 })).toBe(false);
  });

  it('flags a short clip as finished only within its final tenth', () => {
    // 8s clip → window caps at 0.8s, so it is finished once past 7.2s.
    expect(isVideoFinished({ progressSeconds: 7, duration: 8 })).toBe(false);
    expect(isVideoFinished({ progressSeconds: 8, duration: 8 })).toBe(true);
  });
});
