import path from 'path';
import { getDownloadUrl } from '../gcp-cloud-storage';
import { logger } from 'src/utils/logger';
import { parseM3U8Content, streamPlaylistFile, streamSegments } from './helpers';

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
 * @returns A promise resolving to the cloud storage URL of the streamed playlist
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
const streamM3U8 = async (m3u8Url: string, storagePath: string, options: ProcessOptions = {}): Promise<string> => {
  try {
    logger.info({ m3u8Url, storagePath }, 'Starting M3U8 streaming');

    // Parse m3u8 and get segments
    const { modifiedContent, segments } = await parseM3U8Content(m3u8Url, options.excludePatterns);

    logger.info(
      {
        includedCount: segments.included.length,
        excludedCount: segments.excluded.length,
      },
      'Parsed M3U8 content'
    );

    // Stream playlist file
    const playlistStoragePath = path.join(storagePath, 'playlist.m3u8');
    await streamPlaylistFile(modifiedContent, playlistStoragePath);

    // Stream segments in parallel
    await streamSegments({
      segmentUrls: segments.included,
      baseStoragePath: storagePath,
      options,
    });

    const result = {
      playlistUrl: getDownloadUrl(playlistStoragePath),
      segments,
    };

    logger.info({ playlistUrl: result.playlistUrl }, 'M3U8 streaming completed');
    return result.playlistUrl;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        m3u8Url,
        storagePath,
      },
      'M3U8 streaming failed'
    );
    throw error;
  }
};

export { streamM3U8, ProcessOptions };
