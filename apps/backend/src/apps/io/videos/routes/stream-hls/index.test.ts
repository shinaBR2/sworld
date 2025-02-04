import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { streamHLSHandler } from './index';
import { streamM3U8 } from 'src/services/videos/helpers/m3u8';
import { finalizeVideo } from 'src/database/queries/videos';
import { logger } from 'src/utils/logger';
import { completeTask } from 'src/database/queries/tasks';

// Add finalizeVideo to mocks
vi.mock('src/database/queries/videos', () => ({
  finalizeVideo: vi.fn(),
}));

vi.mock('src/services/videos/helpers/m3u8', () => ({
  streamM3U8: vi.fn(),
}));

vi.mock('src/database/queries/tasks', () => ({
  completeTask: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('src/services/videos/config', () => ({
  videoConfig: {
    excludePatterns: [/\/adjump\//, /\/ads\//, /\/commercial\//],
  },
}));

vi.mock('src/utils/schema', () => ({
  AppError: vi.fn((message: string, details: object) => ({
    message,
    details,
  })),
}));

interface MockResponse extends Response {
  json: Mock;
}

const createMockResponse = (): MockResponse =>
  ({
    json: vi.fn(),
  }) as unknown as MockResponse;

const createMockRequest = (data: any = {}, metadata: any = {}, taskId: string = 'task-123'): Request => {
  const originalPayload = {
    data,
    metadata,
  };

  const mockRequest = {
    body: originalPayload,
    headers: {
      'x-task-id': taskId,
    },
  } as unknown as Request;

  return mockRequest;
};

describe('streamHLSHandler', () => {
  let mockRequest: Request;
  let mockResponse: MockResponse;

  const streamOptions = {
    excludePatterns: [/\/adjump\//, /\/ads\//, /\/commercial\//],
  };
  const defaultData = {
    id: 'video123',
    videoUrl: 'https://example.com/video.mp4',
    userId: 'user123',
  };

  const defaultMetadata = {
    id: 'event123',
  };

  const defaultTaskId = 'task-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = createMockRequest(defaultData, defaultMetadata, defaultTaskId);
    mockResponse = createMockResponse();
  });

  it('should successfully process video and finalize it', async () => {
    const expectedPlayableUrl = 'https://example.com/video.m3u8';
    vi.mocked(streamM3U8).mockResolvedValueOnce(expectedPlayableUrl);
    vi.mocked(finalizeVideo).mockResolvedValueOnce(1);

    await streamHLSHandler(mockRequest, mockResponse);

    expect(streamM3U8).toHaveBeenCalledWith(
      defaultData.videoUrl,
      `videos/${defaultData.userId}/${defaultData.id}`,
      streamOptions
    );
    expect(finalizeVideo).toHaveBeenCalledWith({
      id: defaultData.id,
      source: expectedPlayableUrl,
      thumbnailUrl: '',
    });
    expect(completeTask).toHaveBeenCalledWith({
      taskId: defaultTaskId,
    });
    expect(logger.info).toHaveBeenCalledWith(
      defaultMetadata,
      `[/videos/stream-hls-handler] start processing event "${defaultMetadata.id}", video "${defaultData.id}"`
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: expectedPlayableUrl,
    });
  });

  it('should throw AppError when streamM3U8 fails', async () => {
    const errorMessage = 'Conversion failed';
    vi.mocked(streamM3U8).mockRejectedValueOnce(new Error(errorMessage));

    await expect(streamHLSHandler(mockRequest, mockResponse)).rejects.toMatchObject({
      message: 'Video conversion failed',
      details: {
        videoId: defaultData.id,
        error: errorMessage,
      },
    });

    expect(finalizeVideo).not.toHaveBeenCalled();
    expect(completeTask).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should throw AppError when finalizeVideo fails', async () => {
    const expectedPlayableUrl = 'https://example.com/video.m3u8';
    const errorMessage = 'Database update failed';

    vi.mocked(streamM3U8).mockResolvedValueOnce(expectedPlayableUrl);
    vi.mocked(finalizeVideo).mockRejectedValueOnce(new Error(errorMessage));

    await expect(streamHLSHandler(mockRequest, mockResponse)).rejects.toMatchObject({
      message: 'Video conversion failed',
      details: {
        videoId: defaultData.id,
        error: errorMessage,
      },
    });

    expect(completeTask).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should throw AppError when completeTask fails', async () => {
    const expectedPlayableUrl = 'https://example.com/video.m3u8';
    const errorMessage = 'Failed to complete task';

    vi.mocked(streamM3U8).mockResolvedValueOnce(expectedPlayableUrl);
    vi.mocked(finalizeVideo).mockResolvedValueOnce(1);
    vi.mocked(completeTask).mockRejectedValueOnce(new Error(errorMessage));

    await expect(streamHLSHandler(mockRequest, mockResponse)).rejects.toMatchObject({
      message: 'Video conversion failed',
      details: {
        videoId: defaultData.id,
        error: errorMessage,
      },
    });

    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should log event start with correct metadata', async () => {
    vi.mocked(streamM3U8).mockResolvedValueOnce('some-url');
    vi.mocked(finalizeVideo).mockResolvedValueOnce(1);

    await streamHLSHandler(mockRequest, mockResponse);

    expect(logger.info).toHaveBeenCalledWith(defaultMetadata, expect.stringContaining(defaultData.id));
    expect(logger.info).toHaveBeenCalledWith(defaultMetadata, expect.stringContaining(defaultMetadata.id));
  });

  it('should construct correct output path', async () => {
    const customData = {
      id: 'custom-video',
      videoUrl: 'https://example.com/custom.mp4',
      userId: 'custom-user',
    };
    const customRequest = createMockRequest(customData, defaultMetadata);

    vi.mocked(streamM3U8).mockResolvedValueOnce('some-url');
    vi.mocked(finalizeVideo).mockResolvedValueOnce(1);
    vi.mocked(completeTask).mockResolvedValueOnce(undefined);

    await streamHLSHandler(customRequest, mockResponse);

    expect(streamM3U8).toHaveBeenCalledWith(
      customData.videoUrl,
      `videos/${customData.userId}/${customData.id}`,
      streamOptions
    );
  });
});
