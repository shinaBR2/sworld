import type { Request, Response } from 'express';
import { getPost } from 'src/services/hashnode/queries/posts';
import { deletePost } from 'src/services/hasura/mutations/posts/delete';
import { insertPost } from 'src/services/hasura/mutations/posts/insert';
import { updatePost } from 'src/services/hasura/mutations/posts/update';
import { CustomError } from 'src/utils/custom-error';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateSignature } from '../../validator';
import { postEventsHandler } from './index';
import { AppResponse } from 'src/utils/schema';

vi.mock('../../validator', () => ({
  validateSignature: vi.fn(),
}));

vi.mock('src/services/hashnode/queries/posts', () => ({
  getPost: vi.fn(),
}));

vi.mock('src/services/hasura/mutations/posts/insert', () => ({
  insertPost: vi.fn(),
}));

vi.mock('src/services/hasura/mutations/posts/update', () => ({
  updatePost: vi.fn(),
}));

vi.mock('src/services/hasura/mutations/posts/delete', () => ({
  deletePost: vi.fn(),
}));

describe('postEventsHandler', () => {
  const mockPost = {
    id: 'post-123',
    title: 'Test Post',
    brief: 'Test Brief',
    content: {
      markdown: 'Test Content',
    },
    readTimeInMinutes: 5,
    slug: 'test-post',
  };

  const mockValidatedData = {
    data: {
      post: { id: mockPost.id },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateSignature).mockReturnValue({ isValid: true });
    vi.mocked(getPost).mockResolvedValue(mockPost);
  });

  it('should handle post_published event', async () => {
    mockValidatedData.data.eventType = 'post_published';
    const result = await postEventsHandler(mockValidatedData);

    expect(getPost).toHaveBeenCalledWith(mockPost.id);
    expect(insertPost).toHaveBeenCalledWith({
      hId: mockPost.id,
      title: mockPost.title,
      brief: mockPost.brief,
      markdownContent: mockPost.content.markdown,
      readTimeInMinutes: mockPost.readTimeInMinutes,
      slug: mockPost.slug,
    });
    expect(result).toEqual(AppResponse(true, 'ok'));
  });

  it('should handle post_updated event', async () => {
    mockValidatedData.data.eventType = 'post_updated';
    const result = await postEventsHandler(mockValidatedData);

    expect(getPost).toHaveBeenCalledWith(mockPost.id);
    expect(updatePost).toHaveBeenCalledWith(mockPost.id, {
      title: mockPost.title,
      brief: mockPost.brief,
      markdownContent: mockPost.content.markdown,
      readTimeInMinutes: mockPost.readTimeInMinutes,
      slug: mockPost.slug,
    });
    expect(result).toEqual(AppResponse(true, 'ok'));
  });

  it('should handle post_deleted event', async () => {
    mockValidatedData.data.eventType = 'post_deleted';
    const result = await postEventsHandler(mockValidatedData);

    expect(deletePost).toHaveBeenCalledWith(mockPost.id);
    expect(result).toEqual(AppResponse(true, 'ok'));
  });

  it('should throw error when post is not found', async () => {
    vi.mocked(getPost).mockResolvedValue(null);
    mockValidatedData.data.eventType = 'post_published';

    await expect(postEventsHandler(mockValidatedData)).rejects.toThrow(
      CustomError,
    );
  });

  it('should throw error when database operation fails', async () => {
    mockValidatedData.data.eventType = 'post_published';
    vi.mocked(insertPost).mockRejectedValue(new Error('DB Error'));

    await expect(postEventsHandler(mockValidatedData)).rejects.toThrow(
      CustomError,
    );
  });
});
