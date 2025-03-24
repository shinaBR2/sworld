import { Request, Response } from 'express';
import { getPost } from 'src/services/hashnode/queries/posts';
import { deletePost } from 'src/services/hasura/mutations/posts/delete';
import { insertPost } from 'src/services/hasura/mutations/posts/insert';
import { updatePost } from 'src/services/hasura/mutations/posts/update';
import { CustomError } from 'src/utils/custom-error';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateSignature } from '../../validator';
import { postEventsHandler } from './index';

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

  const mockRequest = {
    validatedData: {
      signatureHeader: 'valid-signature',
      body: {
        data: {
          post: { id: mockPost.id },
        },
      },
    },
  } as Request;

  const mockResponse = {
    json: vi.fn(),
  } as unknown as Response;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateSignature).mockReturnValue({ isValid: true });
    vi.mocked(getPost).mockResolvedValue(mockPost);
  });

  it('should handle post_published event', async () => {
    mockRequest.validatedData.body.data.eventType = 'post_published';
    await postEventsHandler(mockRequest, mockResponse);

    expect(getPost).toHaveBeenCalledWith(mockPost.id);
    expect(insertPost).toHaveBeenCalledWith({
      hId: mockPost.id,
      title: mockPost.title,
      brief: mockPost.brief,
      markdownContent: mockPost.content.markdown,
      readTimeInMinutes: mockPost.readTimeInMinutes,
      slug: mockPost.slug,
    });
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should handle post_updated event', async () => {
    mockRequest.validatedData.body.data.eventType = 'post_updated';
    await postEventsHandler(mockRequest, mockResponse);

    expect(getPost).toHaveBeenCalledWith(mockPost.id);
    expect(updatePost).toHaveBeenCalledWith(mockPost.id, {
      title: mockPost.title,
      brief: mockPost.brief,
      markdownContent: mockPost.content.markdown,
      readTimeInMinutes: mockPost.readTimeInMinutes,
      slug: mockPost.slug,
    });
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should handle post_deleted event', async () => {
    mockRequest.validatedData.body.data.eventType = 'post_deleted';
    await postEventsHandler(mockRequest, mockResponse);

    expect(deletePost).toHaveBeenCalledWith(mockPost.id);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should throw error when post is not found', async () => {
    vi.mocked(getPost).mockResolvedValue(null);
    mockRequest.validatedData.body.data.eventType = 'post_published';

    await expect(postEventsHandler(mockRequest, mockResponse)).rejects.toThrow(CustomError);
  });

  it('should throw error for invalid signature', async () => {
    vi.mocked(validateSignature).mockReturnValue({
      isValid: false,
      reason: 'Invalid signature',
    });

    await expect(postEventsHandler(mockRequest, mockResponse)).rejects.toThrow(CustomError);
  });

  it('should throw error for invalid event type', async () => {
    mockRequest.validatedData.body.data.eventType = 'invalid_event';

    await expect(postEventsHandler(mockRequest, mockResponse)).rejects.toThrow(CustomError);
  });

  it('should throw error when database operation fails', async () => {
    mockRequest.validatedData.body.data.eventType = 'post_published';
    vi.mocked(insertPost).mockRejectedValue(new Error('DB Error'));

    await expect(postEventsHandler(mockRequest, mockResponse)).rejects.toThrow(CustomError);
  });
});
