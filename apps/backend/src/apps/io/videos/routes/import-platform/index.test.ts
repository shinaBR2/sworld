import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { importPlatformHandler } from './index';
import { logger } from 'src/utils/logger';
import { finalizeVideo } from 'src/database/queries/videos';

// Mock the dependencies
vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('src/utils/schema', () => ({
  AppError: vi.fn((message: string, details: object) => ({
    message,
    details,
  })),
}));

vi.mock('src/database/queries/videos', () => ({
  finalizeVideo: vi.fn(),
}));

interface MockResponse extends Response {
  json: Mock;
}

const createMockResponse = (): MockResponse =>
  ({
    json: vi.fn(),
  }) as unknown as MockResponse;

const createMockRequest = (data: any = {}, metadata: any = {}): Request => {
  const originalPayload = {
    data,
    metadata,
  };

  const mockRequest = {
    body: Buffer.from(JSON.stringify(originalPayload)).toString('base64'),
  } as Request;

  return mockRequest;
};

describe('importPlatformHandler', () => {
  let mockRequest: Request;
  let mockResponse: MockResponse;

  const defaultData = {
    id: 'video123',
    videoUrl: 'https://example.com/video.mp4',
    userId: 'user123',
  };

  const defaultMetadata = {
    id: 'event123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = createMockRequest(defaultData, defaultMetadata);
    mockResponse = createMockResponse();

    // Reset the mock implementation
    (finalizeVideo as Mock).mockResolvedValue(undefined);
  });

  it('should successfully process import request and return video URL', async () => {
    await importPlatformHandler(mockRequest, mockResponse);

    expect(finalizeVideo).toHaveBeenCalledWith({
      id: defaultData.id,
      source: defaultData.videoUrl,
      thumbnailUrl: '',
    });

    expect(logger.info).toHaveBeenCalledWith(
      defaultMetadata,
      `[/videos/import-platform-handler] start processing event "${defaultMetadata.id}", video "${defaultData.id}"`
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: defaultData.videoUrl,
    });
  });

  it('should throw AppError when finalizeVideo fails', async () => {
    const errorMessage = 'Database error';
    (finalizeVideo as Mock).mockRejectedValue(new Error(errorMessage));

    await expect(importPlatformHandler(mockRequest, mockResponse)).rejects.toMatchObject({
      message: 'Video conversion failed',
      details: {
        videoId: defaultData.id,
        error: errorMessage,
      },
    });
  });

  it('should log event start with correct metadata', async () => {
    await importPlatformHandler(mockRequest, mockResponse);

    expect(logger.info).toHaveBeenCalledWith(defaultMetadata, expect.stringContaining(defaultData.id));
    expect(logger.info).toHaveBeenCalledWith(defaultMetadata, expect.stringContaining(defaultMetadata.id));
  });

  it('should handle requests with different data values', async () => {
    const customData = {
      id: 'custom-video',
      videoUrl: 'https://example.com/custom.mp4',
      userId: 'custom-user',
    };
    const customRequest = createMockRequest(customData, defaultMetadata);

    await importPlatformHandler(customRequest, mockResponse);

    expect(finalizeVideo).toHaveBeenCalledWith({
      id: customData.id,
      source: customData.videoUrl,
      thumbnailUrl: '',
    });

    expect(mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: customData.videoUrl,
    });
    expect(logger.info).toHaveBeenCalledWith(defaultMetadata, expect.stringContaining(customData.id));
  });
});

interface TestHelpers {
  createMockRequest: typeof createMockRequest;
  createMockResponse: typeof createMockResponse;
}

export { TestHelpers };
