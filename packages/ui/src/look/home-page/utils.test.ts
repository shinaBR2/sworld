import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { describe, expect, it } from 'vitest';
import {
  buildTimelineRows,
  genPhotoLinkProps,
  groupPhotosByMonth,
  resolveColumns,
} from './utils';

const makePhoto = (
  id: string,
  takenAt: string | null,
  overrides: Partial<TransformedPhoto> = {},
): TransformedPhoto => ({
  id,
  source: `https://example.com/${id}.jpg`,
  mediumUrl: `https://example.com/${id}-medium.jpg`,
  thumbnailUrl: `https://example.com/${id}-thumb.jpg`,
  blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  width: 1920,
  height: 1080,
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

describe('genPhotoLinkProps', () => {
  it('uses the slug as the route param when present', () => {
    const result = genPhotoLinkProps(makePhoto('a', null, { slug: 'sunset' }));
    expect(result).toEqual({
      to: '/photo/$photoId',
      params: { photoId: 'sunset' },
    });
  });

  it('falls back to the id when the slug is null', () => {
    const result = genPhotoLinkProps(
      makePhoto('photo-1', null, { slug: null }),
    );
    expect(result).toEqual({
      to: '/photo/$photoId',
      params: { photoId: 'photo-1' },
    });
  });
});
