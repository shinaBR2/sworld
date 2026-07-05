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

  it('never treats a clip within the end window as finished', () => {
    // Clips whose whole runtime is at/under the 10s window are too short to
    // judge — always kept, so a just-started short clip is never hidden.
    expect(isVideoFinished({ progressSeconds: 2, duration: 8 })).toBe(false);
    expect(isVideoFinished({ progressSeconds: 8, duration: 8 })).toBe(false);
    expect(isVideoFinished({ progressSeconds: 10, duration: 10 })).toBe(false);
  });

  it('uses the flat end window for longer clips, matching the player', () => {
    // A 20s clip is finished within its last 10s — the same threshold the
    // player uses to restart rather than resume, so the two agree.
    expect(isVideoFinished({ progressSeconds: 9, duration: 20 })).toBe(false);
    expect(isVideoFinished({ progressSeconds: 10, duration: 20 })).toBe(true);
  });
});
