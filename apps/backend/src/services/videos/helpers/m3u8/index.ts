import path from 'path';
import { getDownloadUrl } from '../gcp-cloud-storage';
import { logger } from 'src/utils/logger';
import { parseM3U8Content, streamPlaylistFile, streamSegments } from './helpers';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { processThumbnail } from '../thumbnail';

interface ProcessOptions {
  excludePatterns?: RegExp[];
  maxSegmentSize?: number;
  concurrencyLimit?: number;
}

/**
 * Stream an M3U8 playlist and its video segments to cloud storage.
 *
 * @param m3u8Url - The URL of the source M3U8 playlist
 * @param storagePath - The base path in cloud storage where files will be uploaded
 * @param options - Optional configuration for streaming process
 * @returns A promise resolving to an object containing:
 *   - playlistUrl: The cloud storage URL of the streamed playlist
 *   - segments: Information about included and excluded segments
 *   - duration: The total duration of the video
 *
 * @remarks
 * - Parses the M3U8 playlist to extract video segments
 * - Streams the modified playlist file to cloud storage
 * - Streams all included video segments in parallel
 * - Supports optional segment exclusion via excludePatterns
 *
 * @example
 * ```typescript
 * const playlistUrl = await streamM3U8(
 *   'https://example.com/video.m3u8',
 *   'videos/my-movie'
 * );
 * ```
 *
 * @throws {Error} Propagates any errors encountered during streaming process
 * - Logs detailed error information before throwing
 */
const streamM3U8 = async (m3u8Url: string, storagePath: string, options: ProcessOptions = {}) => {
  const context = {
    m3u8Url,
    storagePath,
  };
  logger.info({ m3u8Url, storagePath }, 'Starting M3U8 streaming');

  const { modifiedContent, segments, duration } = await parseM3U8Content(m3u8Url, options.excludePatterns);

  logger.info(
    {
      includedCount: segments.included.length,
      excludedCount: segments.excluded.length,
    },
    'Parsed M3U8 content'
  );

  if (!segments.included.length) {
    throw CustomError.medium('Empty HLS content', {
      errorCode: VIDEO_ERRORS.INVALID_LENGTH,
      context,
      source: 'services/videos/helpers/m3u8/index.ts',
    });
  }

  let thumbnailUrl;
  try {
    const firstSegment = segments.included[0];
    logger.info(firstSegment, 'first segment');
    const thumbnailPath = await processThumbnail({
      url: firstSegment.url,
      duration: firstSegment.duration as number,
      storagePath,
      isSegment: true,
    });
    thumbnailUrl = getDownloadUrl(thumbnailPath);
  } catch (screenshotError) {
    logger.error(
      {
        originalError: screenshotError,
        errorCode: VIDEO_ERRORS.VIDEO_TAKE_SCREENSHOT_FAILED,
        shouldRetry: true,
        context,
      },
      'Failed to generate thumbnail'
    );
  }

  try {
    // Stream playlist file
    const playlistStoragePath = path.join(storagePath, 'playlist.m3u8');
    await streamPlaylistFile(modifiedContent, playlistStoragePath);

    // Stream segments in parallel
    await streamSegments({
      segmentUrls: segments.included.map(s => s.url),
      baseStoragePath: storagePath,
      options,
    });

    const result = {
      playlistUrl: getDownloadUrl(playlistStoragePath),
      segments,
      duration,
      thumbnailUrl,
    };

    logger.info({ playlistUrl: result.playlistUrl }, 'M3U8 streaming completed');
    return result;
  } catch (error) {
    throw CustomError.medium('Failed to stream file to storage', {
      originalError: error,
      errorCode: VIDEO_ERRORS.STORAGE_UPLOAD_FAILED,
      shouldRetry: true,
      context,
      source: 'services/videos/helpers/m3u8/index.ts',
    });
  }
};

export { streamM3U8, ProcessOptions };
