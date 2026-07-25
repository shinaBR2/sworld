import type { TransformedAlbum } from 'core/look/query-hooks/types';
import { describe, expect, it } from 'vitest';
import { formatPhotoCount, genAlbumLinkProps } from './utils';

const makeAlbum = (
  overrides: Partial<TransformedAlbum> = {},
): TransformedAlbum => ({
  id: 'album-1',
  title: 'Test Album',
  thumbnailUrl: 'https://example.com/cover.jpg',
  slug: 'test-album',
  createdAt: '2023-01-01T00:00:00Z',
  description: '',
  photos: [],
  ...overrides,
});

describe('genAlbumLinkProps', () => {
  it('uses the album id as the route param', () => {
    const result = genAlbumLinkProps(
      makeAlbum({ id: 'album-9', slug: 'holiday' }),
    );
    expect(result).toEqual({
      to: '/album/$albumId',
      params: { albumId: 'album-9' },
    });
  });
});

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
