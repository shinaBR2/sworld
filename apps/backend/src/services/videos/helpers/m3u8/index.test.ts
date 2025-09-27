import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { logger } from 'src/utils/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDownloadUrl } from '../gcp-cloud-storage';
import { processThumbnail } from '../thumbnail';
import {
  parseM3U8Content,
  streamPlaylistFile,
  streamSegments,
} from './helpers';
import { streamM3U8 } from './index';

// Mock dependencies
vi.mock('./helpers');
vi.mock('../gcp-cloud-storage');
vi.mock('src/utils/logger', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };

  return {
    logger: mockLogger,
    getCurrentLogger: vi.fn(() => mockLogger),
  };
});
vi.mock('path', async () => {
  return {
    default: {
      join: (...args: string[]) => args.join('/'),
    },
  };
});
vi.mock('../thumbnail', () => ({
  processThumbnail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    medium: vi.fn((message, details) => {
      const error = new Error(message);
      Object.assign(error, details);
      return error;
    }),
  },
}));

describe('streamM3U8', () => {
  const mockM3u8Url = 'https://example.com/video.m3u8';
  const mockStoragePath = 'videos/test-video';
  const mockPlaylistUrl =
    'https://storage.googleapis.com/bucket/videos/test-video/playlist.m3u8';
  const mockThumbnailPath = 'videos/test-video/thumbnail.jpg';
  const mockThumbnailUrl = `https://storage.googleapis.com/bucket/${mockThumbnailPath}`;
  const expectedResult = {
    playlistUrl: mockPlaylistUrl,
    thumbnailUrl: mockThumbnailUrl,
    segments: {
      included: [
        { url: 'segment1.ts', name: '0.ts', duration: 3 },
        { url: 'segment2.ts', name: '1.ts', duration: 3 },
      ],
      excluded: [{ url: 'segment3.ts', name: '' }],
    },
    duration: 300,
  };
  const expectedContext = {
    m3u8Url: mockM3u8Url,
    storagePath: mockStoragePath,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(parseM3U8Content).mockResolvedValue({
      modifiedContent: '#EXTM3U\n#EXT-X-VERSION:3',
      segments: expectedResult.segments,
      duration: expectedResult.duration,
    });

    vi.mocked(streamPlaylistFile).mockResolvedValue(undefined);
    vi.mocked(streamSegments).mockResolvedValue();
    vi.mocked(processThumbnail).mockResolvedValue(mockThumbnailPath);
    vi.mocked(getDownloadUrl)
      .mockReturnValueOnce(mockThumbnailUrl) // First call for thumbnail URL
      .mockReturnValueOnce(mockPlaylistUrl); // Second call for playlist URL
  });

  it('should successfully stream M3U8 content', async () => {
    const result = await streamM3U8(mockM3u8Url, mockStoragePath);

    expect(result).toEqual(expectedResult);
    expect(parseM3U8Content).toHaveBeenCalledWith(mockM3u8Url, undefined);
    expect(streamPlaylistFile).toHaveBeenCalledWith(
      '#EXTM3U\n#EXT-X-VERSION:3',
      'videos/test-video/playlist.m3u8',
    );
    expect(streamSegments).toHaveBeenCalledWith({
      segments: expectedResult.segments.included,
      baseStoragePath: mockStoragePath,
      options: {},
    });
    expect(logger.info).toHaveBeenCalledTimes(4);
  });

  it('should pass excludePattern to parseM3U8Content', async () => {
    const excludePatterns = [/test/];
    await streamM3U8(mockM3u8Url, mockStoragePath, { excludePatterns });

    expect(parseM3U8Content).toHaveBeenCalledWith(mockM3u8Url, excludePatterns);
  });

  it('should pass process options to streamSegments', async () => {
    const options = {
      maxSegmentSize: 1024,
      concurrencyLimit: 5,
    };
    await streamM3U8(mockM3u8Url, mockStoragePath, options);

    expect(streamSegments).toHaveBeenCalledWith({
      segments: expectedResult.segments.included,
      baseStoragePath: mockStoragePath,
      options,
    });
  });

  it('should handle parse errors properly', async () => {
    const error = new Error('Stream failed');
    vi.mocked(parseM3U8Content).mockRejectedValue(error);

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).rejects.toThrow(
      error,
    );
    expect(streamPlaylistFile).not.toHaveBeenCalled();
    expect(streamSegments).not.toHaveBeenCalled();
  });

  it('should throw error when segments are empty and NOT retry', async () => {
    vi.mocked(parseM3U8Content).mockResolvedValue({
      modifiedContent: '#EXTM3U\n#EXT-X-VERSION:3',
      segments: { included: [], excluded: [] },
      duration: 0,
    });

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).rejects.toThrow(
      'Empty HLS content',
    );

    expect(CustomError.medium).toHaveBeenCalledWith('Empty HLS content', {
      errorCode: VIDEO_ERRORS.INVALID_LENGTH,
      context: expectedContext,
      source: 'services/videos/helpers/m3u8/index.ts',
    });
    expect(streamPlaylistFile).not.toHaveBeenCalled();
    expect(streamSegments).not.toHaveBeenCalled();
  });

  it('should process thumbnail from first segment successfully', async () => {
    const result = await streamM3U8(mockM3u8Url, mockStoragePath);

    expect(result).toEqual(expectedResult);
    expect(processThumbnail).toHaveBeenCalledWith({
      url: 'segment1.ts',
      duration: 3,
      storagePath: mockStoragePath,
      isSegment: true,
    });
    expect(getDownloadUrl).toHaveBeenCalledWith(mockThumbnailPath);
  });

  it('should log error when failed to take screenshot and continue', async () => {
    // Reset the getDownloadUrl from the beforeEach
    vi.mocked(getDownloadUrl).mockReset();
    vi.mocked(getDownloadUrl).mockReturnValue(mockPlaylistUrl); // Only return playlist URL

    const screenshotError = new Error('Screenshot failed');
    vi.mocked(processThumbnail).mockRejectedValue(screenshotError);

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).resolves.toEqual({
      ...expectedResult,
      thumbnailUrl: undefined,
    });
    expect(logger.error).toHaveBeenCalledWith(
      {
        originalError: screenshotError,
        errorCode: VIDEO_ERRORS.VIDEO_TAKE_SCREENSHOT_FAILED,
        shouldRetry: true,
        context: expectedContext,
      },
      'Failed to generate thumbnail',
    );

    expect(streamPlaylistFile).toHaveBeenCalled();
    expect(streamSegments).toHaveBeenCalled();
  });

  it('should throw error when failed to stream playlist file and SHOULD retry', async () => {
    const playlistStreamError = new Error('Playlist stream failed');
    vi.mocked(streamPlaylistFile).mockRejectedValue(playlistStreamError);

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).rejects.toThrow(
      'Failed to stream file to storage',
    );

    expect(CustomError.medium).toHaveBeenCalledWith(
      'Failed to stream file to storage',
      {
        originalError: playlistStreamError,
        errorCode: VIDEO_ERRORS.STORAGE_UPLOAD_FAILED,
        shouldRetry: true,
        context: expectedContext,
        source: 'services/videos/helpers/m3u8/index.ts',
      },
    );

    // Verify thumbnail was generated before the stream failure
    expect(processThumbnail).toHaveBeenCalled();
    expect(streamPlaylistFile).toHaveBeenCalled();
    expect(streamSegments).not.toHaveBeenCalled();
  });

  it('should throw error when failed to stream segments and SHOULD retry', async () => {
    const segmentsStreamError = new Error('Segments stream failed');
    vi.mocked(streamSegments).mockRejectedValue(segmentsStreamError);

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).rejects.toThrow(
      'Failed to stream file to storage',
    );

    expect(CustomError.medium).toHaveBeenCalledWith(
      'Failed to stream file to storage',
      {
        originalError: segmentsStreamError,
        errorCode: VIDEO_ERRORS.STORAGE_UPLOAD_FAILED,
        shouldRetry: true,
        context: expectedContext,
        source: 'services/videos/helpers/m3u8/index.ts',
      },
    );

    // Verify thumbnail and playlist were processed before segment streaming
    expect(processThumbnail).toHaveBeenCalled();
    expect(streamPlaylistFile).toHaveBeenCalled();
    expect(streamSegments).toHaveBeenCalled();
  });
});
