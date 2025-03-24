import { describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../client';
import { deletePost } from './delete';

vi.mock('../client', () => ({
  hasuraClient: {
    request: vi.fn(),
  },
}));

describe('deletePost', () => {
  const mockHId = '67e0119df9bbbad779d16ef9';

  it('should call hasura client with correct parameters', async () => {
    const mockResponse = {
      delete_posts: {
        returning: [{ id: 'uuid-1' }],
      },
    };
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await deletePost(mockHId);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation DeletePost'),
      variables: {
        hId: mockHId,
      },
    });
    expect(result).toBe('uuid-1');
  });

  it('should return undefined when post is not found', async () => {
    const mockResponse = {
      delete_posts: {
        returning: [],
      },
    };
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await deletePost(mockHId);

    expect(result).toBeUndefined();
  });

  it('should throw error when hasura request fails', async () => {
    const error = new Error('Hasura error');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(error);

    await expect(deletePost(mockHId)).rejects.toThrow('Hasura error');
  });
});
