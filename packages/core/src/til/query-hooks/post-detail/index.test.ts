import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformPost } from '../transformers';
import { useLoadPostDetail } from './index';

vi.mock('../../../../universal/hooks/use-request');
vi.mock('../transformers');
vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

const mockPostData = {
  title: 'Test Post',
  readTimeInMinutes: 5,
  markdownContent: '# Content',
  id: '123',
  brief: 'Test brief',
  slug: 'test-post',
};

describe('useLoadPostDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle loading state', () => {
    (useRequest as Mock).mockReturnValue({ isLoading: true });
    const { isLoading, posts } = useLoadPostDetail('123');
    expect(isLoading).toBe(true);
    expect(posts).toEqual([]);
  });

  it('should handle error state', () => {
    const mockError = new Error('API error');
    (useRequest as Mock).mockReturnValue({ error: mockError });
    const { error } = useLoadPostDetail('123');
    expect(error).toBe(mockError);
  });

  it('should transform post data', () => {
    (useRequest as Mock).mockReturnValue({
      data: { posts: [mockPostData] },
      isLoading: false,
    });
    (transformPost as Mock).mockImplementation(data => ({ ...data, transformed: true }));

    const { posts } = useLoadPostDetail('123');
    expect(transformPost).toHaveBeenCalledWith(mockPostData);
    expect(posts).toEqual([{ ...mockPostData, transformed: true }]);
  });

  it('should return empty array when no posts', () => {
    (useRequest as Mock).mockReturnValue({ data: { posts: [] } });
    const { posts } = useLoadPostDetail('123');
    expect(posts).toEqual([]);
  });
});
