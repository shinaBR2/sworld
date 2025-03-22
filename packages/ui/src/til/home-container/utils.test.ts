import { describe, expect, it } from 'vitest';
import { Post } from '../posts/type';
import { genlinkProps } from './utils';

describe('genlinkProps', () => {
  const mockPost: Post = {
    id: '123',
    slug: 'test-post',
    title: 'Test Post',
    brief: 'Test brief',
    mContent: '# Content',
    readTimeInMinutes: 5,
  };

  it('should generate correct route props for a post', () => {
    const result = genlinkProps(mockPost);

    expect(result).toEqual({
      to: '/posts/$slug/$id',
      params: {
        id: '123',
        slug: 'test-post',
      },
    });
  });

  it('should handle special characters in slug', () => {
    const postWithSpecialChars: Post = {
      ...mockPost,
      slug: 'üñîcødé-slug!123',
    };

    const result = genlinkProps(postWithSpecialChars);

    expect(result.params.slug).toBe('üñîcødé-slug!123');
    expect(result.to).toBe('/posts/$slug/$id');
  });
});
