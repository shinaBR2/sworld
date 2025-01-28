import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamM3U8 } from './index';
import {
  parseM3U8Content,
  streamPlaylistFile,
  streamSegments,
} from './helpers';
import { getDownloadUrl } from '../gcp-cloud-storage';
import { logger } from 'src/utils/logger';

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

describe('streamM3U8', () => {
  const mockM3u8Url = 'https://example.com/video.m3u8';
  const mockStoragePath = 'videos/test-video';
  const mockPlaylistUrl =
    'https://storage.googleapis.com/bucket/videos/test-video/playlist.m3u8';

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(parseM3U8Content).mockResolvedValue({
      modifiedContent: '#EXTM3U\n#EXT-X-VERSION:3',
      segments: {
        included: ['segment1.ts', 'segment2.ts'],
        excluded: ['segment3.ts'],
      },
    });

    vi.mocked(streamPlaylistFile).mockResolvedValue(undefined);
    vi.mocked(streamSegments).mockResolvedValue();
    vi.mocked(getDownloadUrl).mockReturnValue(mockPlaylistUrl);
  });

  it('should successfully stream M3U8 content', async () => {
    const result = await streamM3U8(mockM3u8Url, mockStoragePath);

    expect(result).toBe(mockPlaylistUrl);
    expect(parseM3U8Content).toHaveBeenCalledWith(mockM3u8Url, undefined);
    expect(streamPlaylistFile).toHaveBeenCalledWith(
      '#EXTM3U\n#EXT-X-VERSION:3',
      'videos/test-video/playlist.m3u8'
    );
    expect(streamSegments).toHaveBeenCalledWith({
      segmentUrls: ['segment1.ts', 'segment2.ts'],
      baseStoragePath: mockStoragePath,
      options: {},
    });
    expect(logger.info).toHaveBeenCalledTimes(3);
  });

  it('should pass excludePattern to parseM3U8Content', async () => {
    const excludePattern = /test/;
    await streamM3U8(mockM3u8Url, mockStoragePath, { excludePattern });

    expect(parseM3U8Content).toHaveBeenCalledWith(mockM3u8Url, excludePattern);
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

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).rejects.toThrow(
      error
    );

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

    await expect(streamM3U8(mockM3u8Url, mockStoragePath)).rejects.toBe(
      errorString
    );

    expect(logger.error).toHaveBeenCalledWith(
      {
        error: errorString,
        m3u8Url: mockM3u8Url,
        storagePath: mockStoragePath,
      },
      'M3U8 streaming failed'
    );
  });
});
