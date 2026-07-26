import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { describe, expect, it } from 'vitest';
import {
  buildTimelineRows,
  genPhotoLinkProps,
  groupPhotosByMonth,
  photoRowHeight,
  resolveColumns,
} from './utils';

const makePhoto = (
  id: string,
  takenAt: string | null,
  overrides: Partial<TransformedPhoto> = {},
): TransformedPhoto => ({
  id,
  type: 'image',
  source: `https://example.com/${id}.jpg`,
  mediumUrl: `https://example.com/${id}-medium.jpg`,
  thumbnailUrl: `https://example.com/${id}-thumb.jpg`,
  blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  width: 1920,
  height: 1080,
  duration: null,
  takenAt,
  slug: `slug-${id}`,
  ...overrides,
});

describe('groupPhotosByMonth', () => {
  it('groups photos by calendar month, newest month first', () => {
    const photos = [
      makePhoto('a', '2023-03-15T10:00:00Z'),
      makePhoto('b', '2023-03-02T09:00:00Z'),
      makePhoto('c', '2023-01-20T08:00:00Z'),
    ];

    const groups = groupPhotosByMonth(photos);

    expect(groups).toHaveLength(2);
    expect(groups[0].key).toBe('2023-03');
    expect(groups[0].label).toBe('March 2023');
    expect(groups[0].photos).toHaveLength(2);
    expect(groups[0].photos.map((photo) => photo.id)).toEqual(['a', 'b']);
    expect(groups[1].key).toBe('2023-01');
    expect(groups[1].label).toBe('January 2023');
    expect(groups[1].photos.map((photo) => photo.id)).toEqual(['c']);
  });

  it('places undated photos in an "Undated" group at the very end', () => {
    const photos = [
      makePhoto('a', null),
      makePhoto('b', '2023-05-01T00:00:00Z'),
      makePhoto('c', null),
    ];

    const groups = groupPhotosByMonth(photos);

    expect(groups).toHaveLength(2);
    expect(groups[0].key).toBe('2023-05');
    expect(groups[1].key).toBe('undated');
    expect(groups[1].label).toBe('Undated');
    expect(groups[1].photos.map((photo) => photo.id)).toEqual(['a', 'c']);
  });

  it('orders months newest-first even when the input is not sorted', () => {
    const photos = [
      makePhoto('a', '2023-01-20T08:00:00Z'),
      makePhoto('b', '2023-03-15T10:00:00Z'),
      makePhoto('c', '2022-12-01T00:00:00Z'),
    ];

    const groups = groupPhotosByMonth(photos);

    expect(groups.map((group) => group.key)).toEqual([
      '2023-03',
      '2023-01',
      '2022-12',
    ]);
  });

  it('returns an empty array for no photos', () => {
    expect(groupPhotosByMonth([])).toEqual([]);
  });
});

describe('buildTimelineRows', () => {
  it('emits one header per month then photos chunked into rows of `columns`', () => {
    const groups = groupPhotosByMonth([
      makePhoto('a', '2023-03-15T10:00:00Z'),
      makePhoto('b', '2023-03-14T10:00:00Z'),
      makePhoto('c', '2023-03-13T10:00:00Z'),
      makePhoto('d', '2023-01-20T08:00:00Z'),
    ]);

    const rows = buildTimelineRows(groups, 2);

    expect(rows).toHaveLength(5);
    expect(rows[0]).toEqual({
      type: 'header',
      key: 'header-2023-03',
      label: 'March 2023',
    });
    expect(rows[1]).toEqual({
      type: 'photos',
      key: 'row-2023-03-0',
      photos: [groups[0].photos[0], groups[0].photos[1]],
    });
    expect(rows[2]).toEqual({
      type: 'photos',
      key: 'row-2023-03-1',
      photos: [groups[0].photos[2]],
    });
    expect(rows[3]).toEqual({
      type: 'header',
      key: 'header-2023-01',
      label: 'January 2023',
    });
    expect(rows[4]).toEqual({
      type: 'photos',
      key: 'row-2023-01-0',
      photos: [groups[1].photos[0]],
    });
  });

  it('returns an empty array for no groups', () => {
    expect(buildTimelineRows([], 4)).toEqual([]);
  });
});

describe('resolveColumns', () => {
  it('picks the largest matching breakpoint', () => {
    expect(
      resolveColumns({ isSm: true, isMd: true, isLg: true, isXl: true }),
    ).toBe(6);
    expect(
      resolveColumns({ isSm: true, isMd: true, isLg: true, isXl: false }),
    ).toBe(5);
    expect(
      resolveColumns({ isSm: true, isMd: true, isLg: false, isXl: false }),
    ).toBe(4);
    expect(
      resolveColumns({ isSm: true, isMd: false, isLg: false, isXl: false }),
    ).toBe(3);
    expect(
      resolveColumns({ isSm: false, isMd: false, isLg: false, isXl: false }),
    ).toBe(2);
  });
});

describe('photoRowHeight', () => {
  it('divides the content width across the columns, minus the gaps, plus the row padding', () => {
    // 6 columns, 8px gap: usable width = 1740 - 5*8 = 1700, tile = 283.333…,
    // row = tile + 8px padding. Matches a measured desktop tile of ~283.4.
    const height = photoRowHeight({
      contentWidth: 1740,
      columns: 6,
      gap: 8,
      rowPadding: 8,
    });
    expect(height).toBeCloseTo(1700 / 6 + 8, 5);
  });

  it('accounts for the gaps between tiles (a single column has no gap)', () => {
    expect(
      photoRowHeight({ contentWidth: 300, columns: 1, gap: 8, rowPadding: 8 }),
    ).toBe(308);
    expect(
      photoRowHeight({ contentWidth: 300, columns: 2, gap: 8, rowPadding: 8 }),
    ).toBe((300 - 8) / 2 + 8);
  });

  it('returns 0 when the width is not known yet, so the caller can fall back', () => {
    expect(
      photoRowHeight({ contentWidth: 0, columns: 4, gap: 8, rowPadding: 8 }),
    ).toBe(0);
  });

  it('yields a different height when the column count changes at the same width', () => {
    // A breakpoint flip re-chunks rows but keeps their keys, so the virtualizer
    // reuses cached heights. Because the height genuinely changes here (5 vs 6
    // columns at one width), that change is the signal the container keys its
    // measurement-cache invalidation on. If these ever matched, the offscreen
    // rows would keep stale heights after a resize.
    const width = 1740;
    const atFive = photoRowHeight({
      contentWidth: width,
      columns: 5,
      gap: 8,
      rowPadding: 8,
    });
    const atSix = photoRowHeight({
      contentWidth: width,
      columns: 6,
      gap: 8,
      rowPadding: 8,
    });
    expect(atFive).not.toBe(atSix);
    expect(atFive).toBeGreaterThan(atSix);
  });
});

describe('genPhotoLinkProps', () => {
  it('uses the photo id as the route param', () => {
    const result = genPhotoLinkProps(
      makePhoto('photo-1', null, { slug: 'sunset' }),
    );
    expect(result).toEqual({
      to: '/photo/$photoId',
      params: { photoId: 'photo-1' },
    });
  });
});
