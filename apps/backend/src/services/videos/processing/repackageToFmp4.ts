import path from 'path';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import type { RepackageDeps, RepackageInput, RepackageResult } from './types';

const PLAYLIST_NAME = 'playlist.m3u8';
const INIT_CONTENT_TYPE = 'video/mp4';
const SEGMENT_CONTENT_TYPE = 'video/iso.segment';
const SOURCE = 'services/videos/processing/repackageToFmp4.ts';

/**
 * Repackage an already-stored `.ts` video into fMP4/CMAF (`init.mp4` + `.m4s`)
 * and upload the new objects alongside the existing `.ts`.
 *
 * This is the on-demand repair for the hls.js MPEG-TS AAC-demux noise bug (see
 * `src/docs/fmp4-default-output/`): the default streaming flow is untouched; a
 * human runs this for a single `ready` video that turns out noisy.
 *
 * It is **purely additive and non-destructive** — it never overwrites
 * `playlist.m3u8` and never deletes the old `.ts`. The destructive swap (point
 * the shared playlist at the fMP4 files) and the cleanup of the old `.ts` are
 * the caller's job (P2). That split guarantees a failed repackage can never
 * leave a broken video.
 *
 * Framework-/env-agnostic: every effect goes through an injected port, so it's
 * unit-testable with fakes. The real ffmpeg + GCS wiring is the adapter's (P2).
 */
const repackageToFmp4 = async (
  input: RepackageInput,
  deps: RepackageDeps,
): Promise<RepackageResult> => {
  const { storagePath } = input;
  // The repair reads the `.ts` we already own — its public playlist URL, fed to
  // ffmpeg as the remux source. (No original third-party URL: it's likely gone.)
  const sourceUrl = deps.storage.getDownloadUrl(
    path.posix.join(storagePath, PLAYLIST_NAME),
  );
  deps.logger.info(
    { storagePath, sourceUrl },
    'Repackaging stored .ts to fMP4',
  );

  const { artifacts, cleanup } =
    await deps.repackage.repackageToFmp4(sourceUrl);

  try {
    if (!artifacts.segments.length) {
      throw CustomError.medium('Repackage produced no segments', {
        errorCode: VIDEO_ERRORS.INVALID_LENGTH,
        context: { storagePath },
        source: SOURCE,
      });
    }

    try {
      // Upload init first, then each `.m4s`. New filenames never collide with
      // the existing `.ts`, so this only adds objects — the video keeps playing
      // off its current `.ts` playlist until the caller (P2) swaps it.
      await deps.storage.uploadStream({
        stream: artifacts.init.stream,
        storagePath: path.posix.join(storagePath, artifacts.init.name),
        contentType: INIT_CONTENT_TYPE,
      });

      const segmentNames: string[] = [];
      for (const segment of artifacts.segments) {
        await deps.storage.uploadStream({
          stream: segment.stream,
          storagePath: path.posix.join(storagePath, segment.name),
          contentType: SEGMENT_CONTENT_TYPE,
        });
        segmentNames.push(segment.name);
      }

      const result: RepackageResult = {
        initName: artifacts.init.name,
        segmentNames,
        playlistContent: artifacts.playlistContent,
      };
      deps.logger.info(
        {
          storagePath,
          initName: result.initName,
          segmentCount: segmentNames.length,
        },
        'fMP4 repackage uploaded (playlist swap pending)',
      );
      return result;
    } catch (error) {
      throw CustomError.medium('Failed to upload fMP4 artifacts', {
        originalError: error,
        errorCode: VIDEO_ERRORS.STORAGE_UPLOAD_FAILED,
        shouldRetry: true,
        context: { storagePath },
        source: SOURCE,
      });
    }
  } finally {
    // Cleanup (temp dir removal) must never mask the real failure above, nor
    // fail an otherwise-successful repair — a leaked temp dir is only worth a
    // warning. So swallow-and-log; the primary error always propagates.
    try {
      await cleanup();
    } catch (cleanupError) {
      deps.logger.warn(
        { storagePath, cleanupError },
        'fMP4 repackage cleanup failed',
      );
    }
  }
};

export { repackageToFmp4 };
