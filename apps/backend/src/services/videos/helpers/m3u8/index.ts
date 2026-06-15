import { processStream } from 'src/services/videos/processing/processStream';
import type {
  ProcessStreamDeps,
  ProcessStreamResult,
} from 'src/services/videos/processing/types';
import { fetchWithError } from 'src/utils/fetch';
import { getCurrentLogger } from 'src/utils/logger';
import { systemConfig } from 'src/utils/systemConfig';
import { videoConfig } from '../../config';
import { getDownloadUrl, streamFile } from '../gcp-cloud-storage';
import { processThumbnail } from '../thumbnail';

interface ProcessOptions {
  excludePatterns?: RegExp[];
  maxSegmentSize?: number;
  concurrencyLimit?: number;
  /** Per-source request headers (e.g. Referer) for the playlist + segment fetches. */
  customRequestHeaders?: Record<string, string>;
}

/**
 * Backend adapter: wires the env-coupled backend implementations (GCS storage,
 * `fetchWithError`, ffmpeg thumbnail, the request logger) into the injectable
 * `processStream` core. The CLI builds its own deps the same way.
 */
const buildBackendDeps = (): ProcessStreamDeps => ({
  storage: {
    uploadStream: ({ stream, storagePath, contentType }) =>
      streamFile({ stream, storagePath, options: { contentType } }),
    getDownloadUrl,
  },
  http: {
    // Default to the external-request timeout so segment fetches keep their
    // previous 15s budget (fetchWithError's own default is shorter).
    fetch: (url, init) =>
      fetchWithError(url, {
        ...init,
        timeout: init?.timeout ?? systemConfig.defaultExternalRequestTimeout,
      }),
  },
  thumbnail: {
    generateFromSegment: async ({
      url,
      duration,
      storagePath,
      customRequestHeaders,
    }) => {
      const thumbnailPath = await processThumbnail({
        url,
        duration,
        storagePath,
        isSegment: true,
        customRequestHeaders,
      });
      return getDownloadUrl(thumbnailPath);
    },
  },
  logger: getCurrentLogger(),
});

/**
 * Stream an M3U8 playlist and its segments to cloud storage via the shared
 * processing core. Kept as the io adapter so existing callers are unchanged.
 */
const streamM3U8 = async (
  m3u8Url: string,
  storagePath: string,
  options: ProcessOptions = {},
): Promise<ProcessStreamResult> =>
  processStream(
    { sourceUrl: m3u8Url, storagePath },
    {
      excludePatterns: options.excludePatterns,
      concurrencyLimit:
        options.concurrencyLimit ?? videoConfig.defaultConcurrencyLimit,
      customRequestHeaders: options.customRequestHeaders,
    },
    buildBackendDeps(),
  );

export { type ProcessOptions, streamM3U8 };
