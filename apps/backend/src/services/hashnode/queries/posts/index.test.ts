import { describe, expect, it, vi } from 'vitest';
import { getPost } from './index';

// Create a mock client with proper typing
const mockRequest = vi.fn();
const mockClient = { request: mockRequest };
vi.mock('../../client', () => ({
  getHashnodeClient: vi.fn(() => mockClient),
}));

describe('getPost', () => {
  const mockPost = {
    id: '67e0119df9bbbad779d16ef9',
    title: 'Test Post',
    subtitle: 'Test Subtitle',
    brief: 'Test Brief',
    url: 'https://test.hashnode.dev/test-post',
    slug: 'test-post',
    content: {
      markdown: '# Test Content',
    },
    readTimeInMinutes: 5,
  };

  it('should fetch post successfully', async () => {
    mockRequest.mockResolvedValueOnce({ post: mockPost });

    const result = await getPost(mockPost.id);

    expect(mockRequest).toHaveBeenCalledWith(expect.stringContaining('query GetPost'), {
      id: mockPost.id,
    });
    expect(result).toEqual(mockPost);
  });

  it('should return null when post is not found', async () => {
    mockRequest.mockResolvedValueOnce({ post: null });

    const result = await getPost('non-existent-id');

    expect(result).toBeNull();
  });

  it('should throw error when request fails', async () => {
    mockRequest.mockRejectedValueOnce(new Error('API Error'));

    await expect(getPost('some-id')).rejects.toThrow('API Error');
  });
});
