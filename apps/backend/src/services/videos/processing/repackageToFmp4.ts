import { Readable } from 'node:stream';
import path from 'path';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import type { RepackageDeps, RepackageInput, RepackageResult } from './types';

const PLAYLIST_NAME = 'playlist.m3u8';
const INIT_CONTENT_TYPE = 'video/mp4';
const SEGMENT_CONTENT_TYPE = 'video/iso.segment';
const PLAYLIST_CONTENT_TYPE = 'application/vnd.apple.mpegurl';
const SOURCE = 'services/videos/processing/repackageToFmp4.ts';

/**
 * Reprocess a stored video into a clean fMP4/CMAF rendition (`init.mp4` +
 * `.m4s` + `playlist.m3u8`) via a lossless `-c copy` remux, and upload EVERY
 * output under a fresh versioned directory (`outputStoragePath`).
 *
 * Cache-safety is the whole point (SWO-639): stored objects carry a 1-year
 * `max-age` and `storage.googleapis.com` never purges its edge on overwrite, so
 * re-uploading under an existing name is invisible for a year. Writing the
 * entire rendition — manifest included — under a never-before-used `v<N>/` path
 * sidesteps caching, and the caller then repoints `videos.source` at the new
 * manifest. The previous objects are left untouched (harmless orphans), so a
 * failed reprocess can never break the currently-playing video.
 *
 * Framework-/env-agnostic: every effect goes through an injected port, so it's
 * unit-testable with fakes. The real ffmpeg + GCS wiring is the adapter's.
 */
const repackageToFmp4 = async (
  input: RepackageInput,
  deps: RepackageDeps,
): Promise<RepackageResult> => {
  const { source, outputStoragePath } = input;
  deps.logger.info(
    { outputStoragePath, sourceKind: source.kind },
    'Reprocessing stored video to a versioned fMP4 rendition',
  );

  const { artifacts, cleanup } = await deps.repackage.repackageToFmp4(source);

  try {
    if (!artifacts.segments.length) {
      throw CustomError.medium('Repackage produced no segments', {
        errorCode: VIDEO_ERRORS.INVALID_LENGTH,
        context: { outputStoragePath },
        source: SOURCE,
      });
    }

    try {
      // Everything lands under the fresh versioned dir, so no upload can
      // overwrite a cache-immutable object — the video keeps playing off its
      // current manifest until the caller repoints `source` to the new one.
      await deps.storage.uploadStream({
        stream: artifacts.init.stream,
        storagePath: path.posix.join(outputStoragePath, artifacts.init.name),
        contentType: INIT_CONTENT_TYPE,
      });

      const segmentNames: string[] = [];
      for (const segment of artifacts.segments) {
        await deps.storage.uploadStream({
          stream: segment.stream,
          storagePath: path.posix.join(outputStoragePath, segment.name),
          contentType: SEGMENT_CONTENT_TYPE,
        });
        segmentNames.push(segment.name);
      }

      // The manifest is versioned too (it lives at a fresh URL, so a 1-year
      // cache is correct here — unlike an in-place overwrite, which had to be
      // `no-cache`). Uploaded LAST so the manifest never references a segment
      // that isn't up yet.
      const manifestStoragePath = path.posix.join(
        outputStoragePath,
        PLAYLIST_NAME,
      );
      await deps.storage.uploadStream({
        stream: Readable.from(artifacts.playlistContent),
        storagePath: manifestStoragePath,
        contentType: PLAYLIST_CONTENT_TYPE,
      });

      const result: RepackageResult = {
        initName: artifacts.init.name,
        segmentNames,
        manifestStoragePath,
      };
      deps.logger.info(
        {
          outputStoragePath,
          initName: result.initName,
          segmentCount: segmentNames.length,
        },
        'Versioned fMP4 rendition uploaded (source repoint pending)',
      );
      return result;
    } catch (error) {
      throw CustomError.medium('Failed to upload fMP4 artifacts', {
        originalError: error,
        errorCode: VIDEO_ERRORS.STORAGE_UPLOAD_FAILED,
        shouldRetry: true,
        context: { outputStoragePath },
        source: SOURCE,
      });
    }
  } finally {
    // Cleanup (temp dir removal) must never mask the real failure above, nor
    // fail an otherwise-successful reprocess — a leaked temp dir is only worth a
    // warning. So swallow-and-log; the primary error always propagates.
    try {
      await cleanup();
    } catch (cleanupError) {
      deps.logger.warn(
        { outputStoragePath, cleanupError },
        'fMP4 repackage cleanup failed',
      );
    }
  }
};

export { repackageToFmp4 };
