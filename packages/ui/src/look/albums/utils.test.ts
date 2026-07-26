import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { describe, expect, it } from 'vitest';
import {
  buildAlbumRows,
  formatPhotoCount,
  genAlbumPhotoLinkProps,
} from './utils';

const makePhoto = (id: string, takenAt: string | null): TransformedPhoto => ({
  id,
  type: 'image',
  source: `https://example.com/${id}.jpg`,
  mediumUrl: `https://example.com/${id}-medium.jpg`,
  thumbnailUrl: `https://example.com/${id}-thumb.jpg`,
  blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  width: 1200,
  height: 1200,
  duration: null,
  takenAt,
  slug: id,
});

// All in the same month (June 2023) so grouping produces a single month group.
const makePhotos = (count: number): TransformedPhoto[] =>
  Array.from({ length: count }, (_, index) =>
    makePhoto(`photo-${index}`, '2023-06-01T10:00:00Z'),
  );

describe('formatPhotoCount', () => {
  it('uses the singular noun for exactly one photo', () => {
    expect(formatPhotoCount(1)).toBe('1 photo');
  });

  it('uses the plural noun for zero photos', () => {
    expect(formatPhotoCount(0)).toBe('0 photos');
  });

  it('uses the plural noun for many photos', () => {
    expect(formatPhotoCount(87)).toBe('87 photos');
  });
});

describe('buildAlbumRows', () => {
  it('emits a header row then an empty row when there are no photos', () => {
    const rows = buildAlbumRows([], 3);
    expect(rows).toEqual([
      { type: 'header', key: 'album-header' },
      { type: 'empty', key: 'album-empty' },
    ]);
  });

  it('groups photos by month under the header, chunked in order', () => {
    const photos = makePhotos(5);
    const rows = buildAlbumRows(photos, 2);
    expect(rows).toEqual([
      { type: 'header', key: 'album-header' },
      { type: 'month', key: 'album-month-2023-06', label: 'June 2023' },
      {
        type: 'photos',
        key: 'album-row-2023-06-0',
        photos: [photos[0], photos[1]],
      },
      {
        type: 'photos',
        key: 'album-row-2023-06-1',
        photos: [photos[2], photos[3]],
      },
      { type: 'photos', key: 'album-row-2023-06-2', photos: [photos[4]] },
    ]);
  });

  it('puts a month group in a single row when columns exceeds the count', () => {
    const photos = makePhotos(3);
    const rows = buildAlbumRows(photos, 6);
    expect(rows).toEqual([
      { type: 'header', key: 'album-header' },
      { type: 'month', key: 'album-month-2023-06', label: 'June 2023' },
      { type: 'photos', key: 'album-row-2023-06-0', photos },
    ]);
  });

  it('emits a month heading per month, newest first, undated last', () => {
    const july = makePhoto('july', '2023-07-15T10:00:00Z');
    const june = makePhoto('june', '2023-06-15T10:00:00Z');
    const undated = makePhoto('undated', null);
    const rows = buildAlbumRows([june, undated, july], 3);
    expect(rows).toEqual([
      { type: 'header', key: 'album-header' },
      { type: 'month', key: 'album-month-2023-07', label: 'July 2023' },
      { type: 'photos', key: 'album-row-2023-07-0', photos: [july] },
      { type: 'month', key: 'album-month-2023-06', label: 'June 2023' },
      { type: 'photos', key: 'album-row-2023-06-0', photos: [june] },
      { type: 'month', key: 'album-month-undated', label: 'Undated' },
      { type: 'photos', key: 'album-row-undated-0', photos: [undated] },
    ]);
  });
});

describe('genAlbumPhotoLinkProps', () => {
  it('links to the album-scoped photo route with both ids', () => {
    const photo = makePhoto('photo-9', '2023-06-01T10:00:00Z');
    expect(genAlbumPhotoLinkProps('album-3', photo)).toEqual({
      to: '/album/$albumId/photo/$photoId',
      params: { albumId: 'album-3', photoId: 'photo-9' },
    });
  });
});
