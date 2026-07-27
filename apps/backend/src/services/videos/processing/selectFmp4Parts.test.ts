import { describe, expect, it } from 'vitest';
import { selectFmp4Parts, type StoredPart } from './selectFmp4Parts';

describe('selectFmp4Parts', () => {
  it('recovers the Infinix layout: init first, skip the empty 0.m4s, keep the rest in order', () => {
    const parts: StoredPart[] = [
      { name: 'init.mp4', size: 1_533_135 },
      { name: '0.m4s', size: 24 },
      { name: '2.m4s', size: 2_214_688 },
      { name: '1.m4s', size: 780_340 },
      { name: 'playlist.m3u8', size: 330 },
    ];
    expect(selectFmp4Parts(parts)).toEqual(['init.mp4', '1.m4s', '2.m4s']);
  });

  it('sorts segments numerically, not lexically', () => {
    const parts: StoredPart[] = [
      { name: 'init.mp4', size: 1000 },
      { name: '10.m4s', size: 500 },
      { name: '2.m4s', size: 500 },
    ];
    expect(selectFmp4Parts(parts)).toEqual(['init.mp4', '2.m4s', '10.m4s']);
  });

  it('keeps a healthy first segment when it is not empty', () => {
    const parts: StoredPart[] = [
      { name: 'init.mp4', size: 1400 },
      { name: '0.m4s', size: 500_000 },
      { name: '1.m4s', size: 400_000 },
    ];
    expect(selectFmp4Parts(parts)).toEqual(['init.mp4', '0.m4s', '1.m4s']);
  });

  it('throws when there is no init.mp4 to recover from', () => {
    expect(() => selectFmp4Parts([{ name: '0.m4s', size: 500_000 }])).toThrow(
      /no init\.mp4/,
    );
  });

  it('returns the init alone when every .m4s is empty (single-fragment recovery)', () => {
    // A short video whose whole media lives in the (large) init, with only an
    // empty 0.m4s — [init] alone is still a valid remuxable stream.
    expect(
      selectFmp4Parts([
        { name: 'init.mp4', size: 1_533_135 },
        { name: '0.m4s', size: 24 },
      ]),
    ).toEqual(['init.mp4']);
  });
});
