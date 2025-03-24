import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InsertPostMutation, Posts_Insert_Input } from '../../generated-graphql/graphql';
import { hasuraClient } from '../client';
import { insertPost } from './insert';

// Mock GraphQL client
vi.mock('../client', () => ({
  hasuraClient: {
    request: vi.fn(),
  },
}));

describe('insertPost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPost: Posts_Insert_Input = {
    title: 'Test Post',
    slug: 'test-post',
    hId: '123',
    markdownContent: '# Hello World',
    readTimeInMinutes: 5,
    brief: 'Test brief',
  };

  const mockResponse: InsertPostMutation = {
    insert_posts_one: {
      id: 'post123',
    },
  };

  it('should call hasuraClient.request with correct parameters', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    await insertPost(mockPost);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.any(String),
      variables: {
        object: mockPost,
      },
    });
  });

  it('should return post ID from the response', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await insertPost(mockPost);
    expect(result).toBe('post123');
  });

  it('should throw an error when hasuraClient.request fails', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(insertPost(mockPost)).rejects.toThrow(mockError);
  });
});
