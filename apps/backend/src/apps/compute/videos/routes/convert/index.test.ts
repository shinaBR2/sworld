import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertHandler } from './index';
import { convertVideo } from 'src/services/videos/convert/handler';
import { logger } from 'src/utils/logger';
import { Request, Response } from 'express';

vi.mock('src/services/videos/convert/handler', () => ({
  convertVideo: vi.fn(),
}));
vi.mock('src/utils/logger');
vi.mock('src/utils/schema', () => ({
  AppError: (message: string, details: object) => {
    const error = new Error(message);
    return error;
  },
}));

describe('convertHandler', () => {
  const originalPayload = {
    data: {
      id: 'video-123',
      userId: 'user-456',
      videoUrl: 'https://example.com/video.mp4',
    },
    metadata: {
      id: 'event-789',
      spanId: 'span-abc',
      traceId: 'trace-def',
    },
  };
  const mockRequest = {
    body: Buffer.from(JSON.stringify(originalPayload)).toString('base64'),
  } as Request;

  const mockResponse = {
    json: vi.fn(),
  } as unknown as Response;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully convert video and return response', async () => {
    const mockPlayableUrl = 'https://gsapi.com/index.m3u8';
    vi.mocked(convertVideo).mockResolvedValue(mockPlayableUrl);

    await convertHandler(mockRequest, mockResponse);

    expect(logger.info).toHaveBeenCalledWith(
      originalPayload.metadata,
      expect.stringContaining('start processing event')
    );
    expect(convertVideo).toHaveBeenCalledWith(originalPayload.data);
    expect(mockResponse.json).toHaveBeenCalledWith({
      playableVideoUrl: mockPlayableUrl,
    });
  });

  it('should throw AppError when video conversion fails', async () => {
    const error = new Error('Conversion failed');
    vi.mocked(convertVideo).mockRejectedValue(error);

    await expect(convertHandler(mockRequest, mockResponse)).rejects.toThrow('Video conversion failed');
    expect(logger.info).toHaveBeenCalled();
    expect(convertVideo).toHaveBeenCalledWith(originalPayload.data);
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
