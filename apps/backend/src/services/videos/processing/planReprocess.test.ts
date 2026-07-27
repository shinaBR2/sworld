import { describe, expect, it } from 'vitest';
import { planReprocess, toStoredParts } from './planReprocess';
import type { StoredObject } from './planReprocess';

const BASE = 'videos/u1/vid1';
const toUrl = (storagePath: string) => `https://cdn.test/${storagePath}`;
const named = (names: Array<[string, number]>): StoredObject[] =>
  names.map(([name, size]) => ({ name: `${BASE}/${name}`, size }));

describe('toStoredParts', () => {
  it('splits into versioning names (all) and top-level parts (no v<N>/)', () => {
    const { relativeNames, topLevel } = toStoredParts(
      named([
        ['playlist.m3u8', 300],
        ['0.ts', 900_000],
        ['v1/init.mp4', 1368],
        ['v1/playlist.m3u8', 300],
      ]),
      BASE,
    );
    expect(relativeNames).toEqual([
      'playlist.m3u8',
      '0.ts',
      'v1/init.mp4',
      'v1/playlist.m3u8',
    ]);
    expect(topLevel).toEqual([
      { name: 'playlist.m3u8', size: 300 },
      { name: '0.ts', size: 900_000 },
    ]);
  });

  it('drops the base prefix itself (empty relative name)', () => {
    const { relativeNames } = toStoredParts(
      [{ name: `${BASE}/`, size: 0 }, ...named([['0.ts', 10]])],
      BASE,
    );
    expect(relativeNames).toEqual(['0.ts']);
  });
});

describe('planReprocess', () => {
  it('plans a .ts remux into v1 for a fresh base', () => {
    const { source, outputStoragePath } = planReprocess(
      named([
        ['playlist.m3u8', 300],
        ['0.ts', 900_000],
      ]),
      BASE,
      toUrl,
    );
    expect(source).toEqual({
      kind: 'hls-url',
      url: `https://cdn.test/${BASE}/playlist.m3u8`,
    });
    expect(outputStoragePath).toBe(`${BASE}/v1`);
  });

  it('plans an fMP4 recovery (empty first segment dropped) into v1', () => {
    const { source, outputStoragePath } = planReprocess(
      named([
        ['init.mp4', 1_533_135],
        ['0.m4s', 24],
        ['1.m4s', 780_340],
        ['playlist.m3u8', 330],
      ]),
      BASE,
      toUrl,
    );
    expect(source).toEqual({
      kind: 'fmp4-parts',
      partUrls: [
        `https://cdn.test/${BASE}/init.mp4`,
        `https://cdn.test/${BASE}/1.m4s`,
      ],
    });
    expect(outputStoragePath).toBe(`${BASE}/v1`);
  });

  it('bumps past the highest existing version, reading original top-level parts', () => {
    const { source, outputStoragePath } = planReprocess(
      named([
        ['playlist.m3u8', 300],
        ['0.ts', 900_000],
        ['v1/init.mp4', 1368],
        ['v2/init.mp4', 1368],
      ]),
      BASE,
      toUrl,
    );
    // Source still comes from the original top-level .ts, not a prior rendition.
    expect(source.kind).toBe('hls-url');
    expect(outputStoragePath).toBe(`${BASE}/v3`);
  });

  it('throws when nothing is stored', () => {
    expect(() => planReprocess([], BASE, toUrl)).toThrow(/Nothing stored/);
  });
});
