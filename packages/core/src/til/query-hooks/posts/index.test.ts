import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { useRequest } from '../../../universal/hooks/use-request';
import { useLoadPosts } from './index';

vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

const mockPosts = [
  {
    id: '1',
    title: 'Test Post',
    brief: 'Test brief',
    markdownContent: '# Content',
    readTimeInMinutes: 5,
  },
];

describe('useLoadPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Update all test cases to use the mock directly
  it('should handle loading state', () => {
    (useRequest as Mock).mockReturnValue({ isLoading: true });
    const { isLoading, posts } = useLoadPosts();
    expect(isLoading).toBe(true);
    expect(posts).toEqual([]);
  });

  it('should handle error state', () => {
    const mockError = new Error('API error');
    (useRequest as Mock).mockReturnValue({ error: mockError });
    const { error } = useLoadPosts();
    expect(error).toBe(mockError);
  });

  it('should transform posts when data is available', () => {
    (useRequest as Mock).mockReturnValue({
      data: { posts: mockPosts },
      isLoading: false,
    });

    const { posts } = useLoadPosts();

    expect(posts).toEqual([
      {
        id: '1',
        title: 'Test Post',
        brief: 'Test brief',
        mContent: '# Content',
        readTimeInMinutes: 5,
      },
    ]);
  });

  it('should return empty array when no data', () => {
    (useRequest as Mock).mockReturnValue({ data: null });
    const { posts } = useLoadPosts();
    expect(posts).toEqual([]);
  });
});
