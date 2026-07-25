import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { describe, expect, it } from 'vitest';
import { stepPhotoId } from './utils';

const makePhoto = (id: string): TransformedPhoto => ({
  id,
  source: `https://example.com/${id}.jpg`,
  mediumUrl: `https://example.com/${id}-medium.jpg`,
  thumbnailUrl: `https://example.com/${id}-thumb.jpg`,
  blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  width: 1920,
  height: 1080,
  takenAt: '2023-01-01T00:00:00Z',
  slug: `slug-${id}`,
});

const photos = [makePhoto('a'), makePhoto('b'), makePhoto('c')];

describe('stepPhotoId', () => {
  it('returns the next photo id going forward', () => {
    expect(stepPhotoId(photos, 'b', 1)).toBe('c');
  });

  it('returns the previous photo id going backward', () => {
    expect(stepPhotoId(photos, 'b', -1)).toBe('a');
  });

  it('returns null past the last photo (no wrap)', () => {
    expect(stepPhotoId(photos, 'c', 1)).toBe(null);
  });

  it('returns null before the first photo (no wrap)', () => {
    expect(stepPhotoId(photos, 'a', -1)).toBe(null);
  });

  it('returns null when the active id is not in the list', () => {
    expect(stepPhotoId(photos, 'missing', 1)).toBe(null);
  });

  it('returns null for a single-photo list in either direction', () => {
    const single = [makePhoto('only')];
    expect(stepPhotoId(single, 'only', 1)).toBe(null);
    expect(stepPhotoId(single, 'only', -1)).toBe(null);
  });
});
