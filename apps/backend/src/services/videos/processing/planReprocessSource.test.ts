import { describe, expect, it } from 'vitest';
import { planReprocessSource } from './planReprocessSource';
import type { StoredPart } from './selectFmp4Parts';

describe('planReprocessSource', () => {
  it('picks the .ts remux when a stored MPEG-TS playlist is present', () => {
    const parts: StoredPart[] = [
      { name: 'playlist.m3u8', size: 300 },
      { name: '0.ts', size: 900_000 },
      { name: '1.ts', size: 850_000 },
    ];
    expect(planReprocessSource(parts)).toEqual({ kind: 'hls-ts' });
  });

  it('recovers from stored fMP4 parts when there is no .ts', () => {
    const parts: StoredPart[] = [
      { name: 'init.mp4', size: 1_533_135 },
      { name: '0.m4s', size: 24 },
      { name: '1.m4s', size: 780_340 },
      { name: 'playlist.m3u8', size: 330 },
    ];
    expect(planReprocessSource(parts)).toEqual({
      kind: 'fmp4-parts',
      partNames: ['init.mp4', '1.m4s'],
    });
  });

  it('propagates the recovery error when nothing is recoverable', () => {
    expect(() =>
      planReprocessSource([{ name: 'playlist.m3u8', size: 300 }]),
    ).toThrow(/no init\.mp4/);
  });

  it('throws a clear error when nothing is stored at all', () => {
    expect(() => planReprocessSource([])).toThrow(/Nothing stored/);
  });
});
