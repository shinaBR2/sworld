import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fixThumbnailHandler } from './index';
import { fixVideoThumbnail } from 'src/services/hasura/mutations/videos/fixThumbnail';
import { getVideoById } from 'src/services/hasura/queries/videos';
import { parseM3U8Content } from 'src/services/videos/helpers/m3u8/helpers';
import { processThumbnail } from 'src/services/videos/helpers/thumbnail';
import { getDownloadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import type { HandlerContext } from 'src/utils/requestHandler';

// Mock dependencies
vi.mock('src/services/hasura/queries/videos', () => ({
  getVideoById: vi.fn(),
}));

vi.mock('src/services/hasura/mutations/videos/fixThumbnail', () => ({
  fixVideoThumbnail: vi.fn(),
}));

vi.mock('src/services/videos/helpers/m3u8/helpers', () => ({
  parseM3U8Content: vi.fn(),
}));

vi.mock('src/services/videos/helpers/thumbnail', () => ({
  processThumbnail: vi.fn(),
}));

vi.mock('src/services/videos/helpers/gcp-cloud-storage', () => ({
  getDownloadUrl: vi.fn(),
}));

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    medium: vi.fn().mockImplementation((message, options) => {
      throw new Error(message);
    }),
  },
}));

const createMockContext = (
  data: { id: string } = { id: 'video-123' },
  headers: Record<string, string> = { 'x-task-id': 'task-456' },
) =>
  ({
    validatedData: {
      body: data,
      headers: {
        'x-task-id': 'task-456',
        'content-type': 'application/json',
        ...headers,
      },
    },
  }) as unknown as HandlerContext<{
    body: { id: string };
    headers: {
      'x-task-id': string;
      'content-type': string;
      [k: string]: unknown;
    };
  }>;

describe('fixThumbnailHandler', () => {
  let mockContext: HandlerContext<{
    body: { id: string };
    headers: {
      'x-task-id': string;
      'content-type': string;
      [k: string]: unknown;
    };
  }>;
  const defaultData = { id: 'video-123' };
  const defaultHeaders = { 'x-task-id': 'task-456' };

  beforeEach(() => {
    mockContext = createMockContext(defaultData, defaultHeaders);
    vi.clearAllMocks();
  });

  it('should successfully fix video thumbnail', async () => {
    const mockVideo = {
      id: 'video-123',
      source: 'video-source',
      user_id: 'user-789',
    };

    (getVideoById as Mock).mockResolvedValue(mockVideo);
    (parseM3U8Content as Mock).mockResolvedValue({
      segments: {
        included: [{ url: 'segment1.ts', duration: 10 }],
      },
    });
    (processThumbnail as Mock).mockResolvedValue('thumbnail-path');
    (getDownloadUrl as Mock).mockReturnValue('thumbnail-url');
    (fixVideoThumbnail as Mock).mockResolvedValue({});

    const result = await fixThumbnailHandler(mockContext);

    expect(getVideoById).toHaveBeenCalledWith('video-123');
    expect(parseM3U8Content).toHaveBeenCalledWith(
      'video-source',
      expect.any(Array),
    );
    expect(processThumbnail).toHaveBeenCalledWith({
      url: 'segment1.ts',
      duration: 10,
      storagePath: 'videos/user-789/video-123',
      isSegment: true,
    });
    expect(fixVideoThumbnail).toHaveBeenCalledWith({
      id: 'video-123',
      thumbnailUrl: 'thumbnail-url',
      taskId: 'task-456',
    });
    expect(result).toEqual({
      success: true,
      message: 'ok',
      dataObject: { taskId: 'task-456' },
    });
  });

  it('should throw error when video is not found', async () => {
    (getVideoById as Mock).mockResolvedValue(null);

    await expect(fixThumbnailHandler(mockContext)).rejects.toThrow(
      'Video not found',
    );

    expect(CustomError.medium).toHaveBeenCalledWith('Video not found', {
      errorCode: VIDEO_ERRORS.FIX_THUMBNAIL_ERROR,
      context: {
        id: 'video-123',
        taskId: 'task-456',
      },
      source: 'apps/io/videos/routes/fix-thumbnail/index.ts',
    });
  });

  it('should throw error when video has no source', async () => {
    (getVideoById as Mock).mockResolvedValue({ id: 'video-123', source: null });

    await expect(fixThumbnailHandler(mockContext)).rejects.toThrow(
      'Video source is missing',
    );

    expect(CustomError.medium).toHaveBeenCalledWith('Video source is missing', {
      errorCode: VIDEO_ERRORS.FIX_THUMBNAIL_ERROR,
      context: {
        id: 'video-123',
        taskId: 'task-456',
      },
      source: 'apps/io/videos/routes/fix-thumbnail/index.ts',
    });
  });

  it('should handle empty segments error', async () => {
    const mockVideo = {
      id: 'video-123',
      source: 'video-source',
    };

    (getVideoById as Mock).mockResolvedValue(mockVideo);
    (parseM3U8Content as Mock).mockResolvedValue({
      segments: { included: [] },
    });

    await expect(fixThumbnailHandler(mockContext)).rejects.toThrow(
      'Empty HLS content',
    );

    expect(CustomError.medium).toHaveBeenCalledWith('Empty HLS content', {
      errorCode: VIDEO_ERRORS.INVALID_LENGTH,
      context: {
        id: 'video-123',
      },
      source: 'services/videos/helpers/m3u8/index.ts',
    });
  });

  it('should handle empty thumbnail URL', async () => {
    const mockVideo = {
      id: 'video-123',
      source: 'video-source',
      user_id: 'user-789',
    };

    (getVideoById as Mock).mockResolvedValue(mockVideo);
    (parseM3U8Content as Mock).mockResolvedValue({
      segments: {
        included: [{ url: 'segment1.ts', duration: 10 }],
      },
    });
    (processThumbnail as Mock).mockResolvedValue('thumbnail-path');
    (getDownloadUrl as Mock).mockReturnValue('');

    await expect(fixThumbnailHandler(mockContext)).rejects.toThrow(
      'Invalid generated thumbnail',
    );

    expect(CustomError.medium).toHaveBeenCalledWith(
      'Invalid generated thumbnail',
      {
        errorCode: VIDEO_ERRORS.FIX_THUMBNAIL_ERROR,
        context: {
          id: 'video-123',
          taskId: 'task-456',
          source: 'video-source',
        },
        shouldRetry: true,
        source: 'apps/io/videos/routes/fix-thumbnail/index.ts',
      },
    );
  });

  it('should handle fix mutation error', async () => {
    const mockVideo = {
      id: 'video-123',
      source: 'video-source',
      user_id: 'user-789',
    };
    const mutationError = new Error('Mutation failed');

    (getVideoById as Mock).mockResolvedValue(mockVideo);
    (parseM3U8Content as Mock).mockResolvedValue({
      segments: {
        included: [{ url: 'segment1.ts', duration: 10 }],
      },
    });
    (processThumbnail as Mock).mockResolvedValue('thumbnail-path');
    (getDownloadUrl as Mock).mockReturnValue('thumbnail-url');
    (fixVideoThumbnail as Mock).mockRejectedValue(mutationError);

    await expect(fixThumbnailHandler(mockContext)).rejects.toThrow(
      'Generate thumbnail failed',
    );

    expect(CustomError.medium).toHaveBeenCalledWith(
      'Generate thumbnail failed',
      {
        originalError: mutationError,
        errorCode: VIDEO_ERRORS.FIX_THUMBNAIL_ERROR,
        context: {
          id: 'video-123',
          taskId: 'task-456',
        },
        shouldRetry: true,
        source: 'apps/io/videos/routes/fix-thumbnail/index.ts',
      },
    );
  });
});
