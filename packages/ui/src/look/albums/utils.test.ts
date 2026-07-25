import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { describe, expect, it } from 'vitest';
import { buildAlbumRows, formatPhotoCount } from './utils';

const makePhotos = (count: number): TransformedPhoto[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `photo-${index}`,
    type: 'image',
    source: `https://example.com/${index}.jpg`,
    mediumUrl: `https://example.com/${index}-medium.jpg`,
    thumbnailUrl: `https://example.com/${index}-thumb.jpg`,
    blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    width: 1200,
    height: 1200,
    duration: null,
    takenAt: '2023-06-01T10:00:00Z',
    slug: `photo-${index}`,
  }));

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

  it('chunks photos into rows of `columns` after the header, in order', () => {
    const photos = makePhotos(5);
    const rows = buildAlbumRows(photos, 2);
    expect(rows).toEqual([
      { type: 'header', key: 'album-header' },
      { type: 'photos', key: 'album-row-0', photos: [photos[0], photos[1]] },
      { type: 'photos', key: 'album-row-1', photos: [photos[2], photos[3]] },
      { type: 'photos', key: 'album-row-2', photos: [photos[4]] },
    ]);
  });

  it('puts every photo in a single row when columns exceeds the count', () => {
    const photos = makePhotos(3);
    const rows = buildAlbumRows(photos, 6);
    expect(rows).toEqual([
      { type: 'header', key: 'album-header' },
      { type: 'photos', key: 'album-row-0', photos },
    ]);
  });
});
