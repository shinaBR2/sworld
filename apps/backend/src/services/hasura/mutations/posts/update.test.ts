import { describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../client';
import { updatePost } from './update';

vi.mock('../client', () => ({
  hasuraClient: {
    request: vi.fn(),
  },
}));

describe('updatePost', () => {
  const mockHId = '67e0119df9bbbad779d16ef9';
  const mockPost = {
    title: 'Updated Title',
    content: 'Updated Content',
  };

  it('should call hasura client with correct parameters', async () => {
    const mockResponse = {
      update_posts: {
        returning: [{ id: 'uuid-1' }],
      },
    };
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await updatePost(mockHId, mockPost);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation UpdatePost'),
      variables: {
        hId: mockHId,
        set: mockPost,
      },
    });
    expect(result).toBe('uuid-1');
  });

  it('should return undefined when post is not found', async () => {
    const mockResponse = {
      update_posts: {
        returning: [],
      },
    };
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await updatePost(mockHId, mockPost);

    expect(result).toBeUndefined();
  });

  it('should throw error when hasura request fails', async () => {
    const error = new Error('Hasura error');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(error);

    await expect(updatePost(mockHId, mockPost)).rejects.toThrow('Hasura error');
  });
});
