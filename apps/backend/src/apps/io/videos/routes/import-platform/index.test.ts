import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { importPlatformHandler } from './index';
import { logger } from 'src/utils/logger';
import { AppError } from 'src/utils/schema';
import { ImportHandlerRequest } from './schema';

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

interface MockResponse extends Response {
  json: vi.Mock;
}

const createMockResponse = (): MockResponse =>
  ({
    json: vi.fn(),
  }) as unknown as MockResponse;

const createMockRequest = (
  data: any = {},
  metadata: any = {}
): ImportHandlerRequest =>
  ({
    body: {
      data,
      metadata,
    },
  }) as ImportHandlerRequest;

describe('importPlatformHandler', () => {
  let mockRequest: ImportHandlerRequest;
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
  });

  it('should successfully process import request and return video URL', async () => {
    await importPlatformHandler(mockRequest, mockResponse);

    expect(logger.info).toHaveBeenCalledWith(
      defaultMetadata,
      `[/videos/import-platform-handler] start processing event "${defaultMetadata.id}", video "${defaultData.id}"`
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: defaultData.videoUrl,
    });
  });

  it('should throw AppError when processing fails', async () => {
    const errorMessage = 'Database error';
    mockResponse.json.mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(
      importPlatformHandler(mockRequest, mockResponse)
    ).rejects.toMatchObject({
      message: 'Video conversion failed',
      details: {
        videoId: defaultData.id,
        error: errorMessage,
      },
    });
  });

  it('should log event start with correct metadata', async () => {
    await importPlatformHandler(mockRequest, mockResponse);

    expect(logger.info).toHaveBeenCalledWith(
      defaultMetadata,
      expect.stringContaining(defaultData.id)
    );
    expect(logger.info).toHaveBeenCalledWith(
      defaultMetadata,
      expect.stringContaining(defaultMetadata.id)
    );
  });

  it('should handle requests with different data values', async () => {
    const customData = {
      id: 'custom-video',
      videoUrl: 'https://example.com/custom.mp4',
      userId: 'custom-user',
    };
    const customRequest = createMockRequest(customData, defaultMetadata);

    await importPlatformHandler(customRequest, mockResponse);

    expect(mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: customData.videoUrl,
    });
    expect(logger.info).toHaveBeenCalledWith(
      defaultMetadata,
      expect.stringContaining(customData.id)
    );
  });
});

interface TestHelpers {
  createMockRequest: typeof createMockRequest;
  createMockResponse: typeof createMockResponse;
}

export { TestHelpers };
