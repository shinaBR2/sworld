import { describe, expect, it } from 'vitest';
import { generatePostDetailRoute } from './index';

describe('generatePostDetailRoute', () => {
  it('should generate route with correct path and params', () => {
    const result = generatePostDetailRoute({
      id: 'post-123',
      slug: 'test-post-slug',
    });

    expect(result).toEqual({
      to: '/posts/$slug/$id',
      params: {
        id: 'post-123',
        slug: 'test-post-slug',
      },
    });
  });

  it('should handle special characters in slug', () => {
    const result = generatePostDetailRoute({
      id: '456',
      slug: 'üñîcødé-slug_2024!',
    });

    expect(result).toEqual({
      to: '/posts/$slug/$id',
      params: {
        id: '456',
        slug: 'üñîcødé-slug_2024!',
      },
    });
  });
});
