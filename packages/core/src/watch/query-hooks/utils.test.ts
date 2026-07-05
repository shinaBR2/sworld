import { describe, expect, it } from 'vitest';
import { VIDEO_FINISHED_END_THRESHOLD_SECONDS, isVideoFinished } from './utils';

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
});
