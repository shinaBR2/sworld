import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamM3U8 } from './index';
import { parseM3U8Content, streamPlaylistFile, streamSegments } from './helpers';
import { getDownloadUrl } from '../gcp-cloud-storage';
import { logger } from 'src/utils/logger';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { processThumbnail } from '../thumbnail';

// Mock dependencies
vi.mock('./helpers');
vi.mock('../gcp-cloud-storage');
vi.mock('src/utils/logger');
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

describe('streamM3U8', () => {
  const mockM3u8Url = 'https://example.com/video.m3u8';
  const mockStoragePath = 'videos/test-video';
  const mockPlaylistUrl = 'https://storage.googleapis.com/bucket/videos/test-video/playlist.m3u8';
  const mockThumbnailPath = 'videos/test-video/thumbnail.jpg';
  const mockThumbnailUrl = `https://storage.googleapis.com/bucket/${mockThumbnailPath}`;
  const expectedResult = {
    playlistUrl: mockPlaylistUrl,
    thumbnailUrl: mockThumbnailUrl,
    segments: {
      included: [
        { url: 'segment1.ts', duration: 3 },
        { url: 'segment2.ts', duration: 3 },
      ],
      excluded: [{ url: 'segment3.ts' }],
    },
    duration: 300,
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
    expect(streamPlaylistFile).toHaveBeenCalledWith('#EXTM3U\n#EXT-X-VERSION:3', 'videos/test-video/playlist.m3u8');
    expect(streamSegments).toHaveBeenCalledWith({
      segmentUrls: ['segment1.ts', 'segment2.ts'],
      baseStoragePath: mockStoragePath,
      options: {},
    });
    expect(logger.info).toHaveBeenCalledTimes(3);
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
      segmentUrls: ['segment1.ts', 'segment2.ts'],
      baseStoragePath: mockStoragePath,
      options,
    });
  });

  it('should handle and log errors properly', async () => {
    const error = new Error('Stream failed');
    vi.mocked(parseM3U8Content).mockRejectedValue(error);

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).rejects.toThrow(error);

    expect(logger.error).toHaveBeenCalledWith(
      {
        error: error.message,
        m3u8Url: mockM3u8Url,
        storagePath: mockStoragePath,
      },
      'M3U8 streaming failed'
    );
  });

  it('should handle non-Error objects in catch block', async () => {
    const errorString = 'Unknown error';
    vi.mocked(parseM3U8Content).mockRejectedValue(errorString);

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).rejects.toBe(errorString);

    expect(logger.error).toHaveBeenCalledWith(
      {
        error: errorString,
        m3u8Url: mockM3u8Url,
        storagePath: mockStoragePath,
      },
      'M3U8 streaming failed'
    );
  });

  it('should throw error when segments are empty', async () => {
    vi.mocked(parseM3U8Content).mockResolvedValue({
      modifiedContent: '#EXTM3U\n#EXT-X-VERSION:3',
      segments: { included: [], excluded: [] },
      duration: 0,
    });

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).rejects.toThrow(
      new CustomError('Empty HLS content', {
        errorCode: VIDEO_ERRORS.INVALID_LENGTH,
        context: { m3u8Url: mockM3u8Url },
        source: 'services/videos/helpers/m3u8/index.ts',
      })
    );
  });

  it('should process thumbnail from first segment successfully', async () => {
    const result = await streamM3U8(mockM3u8Url, mockStoragePath);

    expect(result).toEqual(expectedResult);
    expect(processThumbnail).toHaveBeenCalledWith({
      url: 'segment1.ts',
      duration: 3,
      storagePath: mockStoragePath,
    });
    expect(getDownloadUrl).toHaveBeenCalledWith(mockThumbnailPath);
  });

  it('should continue streaming when thumbnail processing fails', async () => {
    const screenshotError = new Error('Screenshot failed');
    vi.mocked(processThumbnail).mockRejectedValue(screenshotError);

    // Reset the getDownloadUrl from the beforeEach
    vi.mocked(getDownloadUrl).mockReset();
    vi.mocked(getDownloadUrl).mockReturnValue(mockPlaylistUrl); // Only return playlist URL

    const result = await streamM3U8(mockM3u8Url, mockStoragePath);
    const { thumbnailUrl, ...expectedWithoutThumbnail } = expectedResult;

    expect(result).toEqual(expectedWithoutThumbnail);
    expect(logger.error).toHaveBeenCalledWith(
      {
        error: screenshotError.message,
        segmentUrl: 'segment1.ts',
      },
      'Failed to take screenshot but continuing with streaming'
    );

    // Verify streaming still completed
    expect(streamPlaylistFile).toHaveBeenCalled();
    expect(streamSegments).toHaveBeenCalled();
  });
});
