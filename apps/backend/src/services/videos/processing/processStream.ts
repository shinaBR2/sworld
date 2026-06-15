import { Readable } from 'node:stream';
import path from 'path';
import { CustomError } from 'src/utils/custom-error';
import { HTTP_ERRORS, VIDEO_ERRORS } from 'src/utils/error-codes';
import { buildRequestHeaders } from 'src/utils/http/buildRequestHeaders';
import { isRetryableError, withRetry } from 'src/utils/retry/withRetry';
import { parseHlsManifest } from './parseHlsManifest';
import { selectVariantUrl } from './selectVariantUrl';
import type {
  HlsSegment,
  ProcessStreamDeps,
  ProcessStreamInput,
  ProcessStreamOptions,
  ProcessStreamResult,
} from './types';

const PLAYLIST_NAME = 'playlist.m3u8';
const PLAYLIST_CONTENT_TYPE = 'application/vnd.apple.mpegurl';
const SEGMENT_CONTENT_TYPE = 'video/MP2T';
const DEFAULT_SEGMENT_CONCURRENCY = 5;

/** Fetch one segment and upload it to storage. Retried as a unit by withRetry. */
const streamSegment = async (
  deps: ProcessStreamDeps,
  segment: HlsSegment,
  storagePath: string,
  customRequestHeaders?: Record<string, string>,
): Promise<void> => {
  const response = await deps.http.fetch(segment.url, {
    headers: buildRequestHeaders(customRequestHeaders),
  });

  if (!response.body) {
    throw new CustomError('Failed to fetch segment', {
      errorCode: HTTP_ERRORS.EMPTY_RESPONSE,
      shouldRetry: false,
      context: {
        segmentUrl: segment.url,
        storagePath,
        responseStatus: response.statusText,
        statusCode: response.status,
      },
    });
  }

  await deps.storage.uploadStream({
    stream: Readable.fromWeb(response.body as never),
    storagePath: path.join(storagePath, segment.name),
    contentType: SEGMENT_CONTENT_TYPE,
  });
};

/**
 * Framework- and env-agnostic stream-processing core: fetch + parse an M3U8
 * playlist, strip ads, generate a thumbnail, and upload the rewritten playlist
 * and its segments — all through injected ports (`deps`). Behaviour-preserving
 * relative to the previous `streamM3U8` (still emits `.ts`); P1 flips packaging
 * to fMP4. Finalize stays with the caller (io vs CLI finalize differently).
 */
const processStream = async (
  input: ProcessStreamInput,
  options: ProcessStreamOptions,
  deps: ProcessStreamDeps,
): Promise<ProcessStreamResult> => {
  const { sourceUrl, storagePath } = input;
  const { excludePatterns, customRequestHeaders } = options;
  // Guard against 0/negative (would make `i += concurrency` hang/never end);
  // matches the previous `||` fallback behaviour.
  const concurrency =
    options.concurrencyLimit && options.concurrencyLimit > 0
      ? options.concurrencyLimit
      : DEFAULT_SEGMENT_CONCURRENCY;
  const errorContext = { sourceUrl, storagePath };

  deps.logger.info(errorContext, 'Starting M3U8 streaming');

  const headers = buildRequestHeaders(customRequestHeaders);

  // Fetch the source; if it's a master playlist, resolve to the best variant
  // and fetch that. Segment URIs resolve against whichever URL we parse.
  let baseUrl = sourceUrl;
  let content = await (await deps.http.fetch(sourceUrl, { headers })).text();
  const variantUrl = selectVariantUrl(content, sourceUrl);
  if (variantUrl) {
    deps.logger.info(
      { variantUrl },
      'Master playlist detected; resolved to best variant',
    );
    baseUrl = variantUrl;
    content = await (await deps.http.fetch(variantUrl, { headers })).text();
  }

  const { modifiedContent, segments, duration } = parseHlsManifest(
    content,
    baseUrl,
    excludePatterns,
  );

  deps.logger.info(
    {
      includedCount: segments.included.length,
      excludedCount: segments.excluded.length,
    },
    'Parsed M3U8 content',
  );

  if (!segments.included.length) {
    throw CustomError.medium('Empty HLS content', {
      errorCode: VIDEO_ERRORS.INVALID_LENGTH,
      context: errorContext,
      source: 'services/videos/processing/processStream.ts',
    });
  }

  const playlistStoragePath = path.join(storagePath, PLAYLIST_NAME);

  // Dry run: resolve + parse only, no thumbnail and no uploads.
  if (options.dryRun) {
    return {
      playlistUrl: deps.storage.getDownloadUrl(playlistStoragePath),
      duration,
      segments,
      modifiedContent,
    };
  }

  // Thumbnail is best-effort: a failure here must not fail the whole video.
  let thumbnailUrl: string | undefined;
  try {
    const firstSegment = segments.included[0];
    thumbnailUrl = await deps.thumbnail.generateFromSegment({
      url: firstSegment.url,
      duration: firstSegment.duration as number,
      storagePath,
      customRequestHeaders,
    });
  } catch (thumbnailError) {
    deps.logger.error(
      { originalError: thumbnailError, ...errorContext },
      'Failed to generate thumbnail',
    );
  }

  try {
    await deps.storage.uploadStream({
      stream: Readable.from(modifiedContent),
      storagePath: playlistStoragePath,
      contentType: PLAYLIST_CONTENT_TYPE,
    });

    // Upload segments in concurrency-limited batches; one dropped connection
    // retries that segment rather than failing the whole video (R1).
    for (let i = 0; i < segments.included.length; i += concurrency) {
      const batch = segments.included.slice(i, i + concurrency);
      await Promise.all(
        batch.map((segment) =>
          withRetry(
            () =>
              streamSegment(deps, segment, storagePath, customRequestHeaders),
            {
              label: `segment ${segment.name}`,
              isRetryable: isRetryableError,
              logger: deps.logger,
            },
          ),
        ),
      );
    }

    const result: ProcessStreamResult = {
      playlistUrl: deps.storage.getDownloadUrl(playlistStoragePath),
      segments,
      duration,
      thumbnailUrl,
      modifiedContent,
    };
    deps.logger.info(
      { playlistUrl: result.playlistUrl },
      'M3U8 streaming completed',
    );
    return result;
  } catch (error) {
    throw CustomError.medium('Failed to stream file to storage', {
      originalError: error,
      errorCode: VIDEO_ERRORS.STORAGE_UPLOAD_FAILED,
      shouldRetry: true,
      context: errorContext,
      source: 'services/videos/processing/processStream.ts',
    });
  }
};

export { processStream };
