/**
 * SERVER-SIDE thumbnail extraction — KEPT AS A REFERENCE/FALLBACK, no longer the
 * primary path. Reached only via the `setVideoThumbnailAtTime` action.
 *
 * Why it was demoted (both observed in production, not on macOS):
 *  1. Cloud Run cold starts routinely blow past Hasura's 30s action timeout, so
 *     the request fails before a frame is ever produced.
 *  2. The Linux ffmpeg build seeks unreliably into a single concatenated fMP4
 *     fragment and sometimes emits NO frame at all (ENOENT on the output file),
 *     even though the identical code works on macOS.
 *
 * Trade-offs:
 *  - Server-side (this code): needs no browser/CORS setup and can target ANY
 *    timestamp even if the user isn't watching — but it's slow and unreliable
 *    (cold start + segment download + ffmpeg) and can't cheaply downscale.
 *  - Client-side (the new PRIMARY path via `setVideoThumbnailUrl`): instant, the
 *    exact frame the user sees, downscaled in-browser to a small thumbnail, no
 *    ffmpeg or cold start — but requires the video to be CORS-clean so the canvas
 *    can capture it.
 *
 * We moved the primary path to the browser for speed and reliability; this server
 * code stays for the cases the client can't cover (e.g. future non-interactive /
 * batch thumbnailing where no one is watching the frame).
 */
import { readFile, writeFile } from 'fs/promises';
import { Parser } from 'm3u8-parser';
import path from 'path';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { fetchWithError } from 'src/utils/fetch';
import { buildRequestHeaders } from 'src/utils/http/buildRequestHeaders';
import { getCurrentLogger } from 'src/utils/logger';
import { takeScreenshotAtTime } from '../ffmpeg';
import {
  cleanupDirectory,
  createDirectory,
  downloadFile,
  generateTempDir,
} from '../file';
import { getDownloadUrl, uploadFile } from '../gcp-cloud-storage';

const ERROR_SOURCE = 'services/videos/helpers/thumbnail/extractAtTime.ts';

interface CoveringSegment {
  /** Absolute URL of the fMP4 initialization segment (from #EXT-X-MAP). */
  initUrl: string;
  /** Absolute URL of the .m4s media segment covering `atSeconds`. */
  segmentUrl: string;
  /** Seek position WITHIN the covering segment, in seconds. */
  offsetInSegment: number;
}

/**
 * Parse an fMP4/CMAF HLS media playlist and locate the segment covering
 * `atSeconds`, together with its initialization segment (`#EXT-X-MAP`).
 *
 * A lone `.m4s` is not decodable on its own, so callers must download the
 * returned `initUrl` alongside `segmentUrl`. Segment durations are summed to
 * find the covering segment and the in-segment seek offset.
 */
const findCoveringSegment = async (props: {
  playlistUrl: string;
  atSeconds: number;
  customRequestHeaders?: Record<string, string>;
}): Promise<CoveringSegment> => {
  const { playlistUrl, atSeconds, customRequestHeaders } = props;

  const response = await fetchWithError(playlistUrl, {
    headers: buildRequestHeaders(customRequestHeaders),
  });
  const content = await response.text();

  const parser = new Parser();
  parser.push(content);
  parser.end();

  const segments = parser.manifest.segments ?? [];
  if (!segments.length) {
    throw CustomError.medium('Empty HLS content', {
      errorCode: VIDEO_ERRORS.INVALID_LENGTH,
      context: { playlistUrl },
      source: ERROR_SOURCE,
    });
  }

  let cumulative = 0;
  for (const segment of segments) {
    const duration = segment.duration ?? 0;
    if (cumulative + duration > atSeconds) {
      const initUri = segment.map?.uri;
      if (!initUri) {
        throw CustomError.medium('HLS segment missing init (#EXT-X-MAP)', {
          errorCode: VIDEO_ERRORS.INVALID_VIDEO_FORMAT,
          context: { playlistUrl, atSeconds },
          source: ERROR_SOURCE,
        });
      }

      return {
        initUrl: new URL(initUri, playlistUrl).toString(),
        segmentUrl: new URL(segment.uri, playlistUrl).toString(),
        offsetInSegment: atSeconds - cumulative,
      };
    }
    cumulative += duration;
  }

  // `atSeconds` is at/after the end — fall back to the last segment's end.
  const last = segments[segments.length - 1];
  const initUri = last.map?.uri;
  if (!initUri) {
    throw CustomError.medium('HLS segment missing init (#EXT-X-MAP)', {
      errorCode: VIDEO_ERRORS.INVALID_VIDEO_FORMAT,
      context: { playlistUrl, atSeconds },
      source: ERROR_SOURCE,
    });
  }

  cumulative -= last.duration ?? 0;
  return {
    initUrl: new URL(initUri, playlistUrl).toString(),
    segmentUrl: new URL(last.uri, playlistUrl).toString(),
    offsetInSegment: Math.max(0, atSeconds - cumulative),
  };
};

/**
 * Concatenate the fMP4 init segment and one media segment into a single
 * self-contained, seekable file. The init.mp4 carries the codec config a lone
 * `.m4s` lacks; prepending it yields a valid fragmented MP4 ffmpeg can decode.
 */
const buildPlayableSegment = async (props: {
  initPath: string;
  segmentPath: string;
  outputPath: string;
}): Promise<void> => {
  const { initPath, segmentPath, outputPath } = props;
  const [init, segment] = await Promise.all([
    readFile(initPath),
    readFile(segmentPath),
  ]);
  await writeFile(outputPath, Buffer.concat([init, segment]));
};

interface ExtractThumbnailAtTimeProps {
  /** Stored fMP4/CMAF HLS playlist URL (the video's `source`). */
  source: string;
  /** Timestamp to grab the frame from, in seconds. Clamped to a valid range. */
  atSeconds: number;
  /** Owning user id — used in the storage path. */
  userId: string;
  /** Video id — used in the storage path. */
  videoId: string;
  /** Total video duration in seconds, if known — used to clamp `atSeconds`. */
  duration?: number;
  /** Per-source request headers (e.g. Referer) for the playlist/segment fetch. */
  customRequestHeaders?: Record<string, string>;
}

/**
 * Extract the frame at an arbitrary `atSeconds` from a video's already-stored
 * fMP4/CMAF HLS output, upload it, and return the public thumbnail URL.
 *
 * Feeding ffmpeg the remote playlist URL directly works but is prohibitively
 * slow: its HLS demuxer downloads every segment from the start up to the seek
 * point. Instead this downloads only the covering `.m4s` plus its `init.mp4`,
 * concatenates them into a seekable fMP4, and seeks to the in-segment offset —
 * a few MB and a fraction of a second regardless of `atSeconds`.
 *
 * The thumbnail is uploaded to
 * `videos/{userId}/{videoId}/thumbnail--<timestamp>.jpg`.
 */
const extractThumbnailAtTime = async (
  props: ExtractThumbnailAtTimeProps,
): Promise<string> => {
  const logger = getCurrentLogger();
  const { source, atSeconds, userId, videoId, duration, customRequestHeaders } =
    props;

  // Clamp: never below 0, and below the video's end when a duration is known.
  let clampedSeconds = Math.max(0, atSeconds);
  if (typeof duration === 'number' && duration > 0) {
    clampedSeconds = Math.min(clampedSeconds, Math.max(0, duration - 1));
  }

  const workingDir = generateTempDir();
  const thumbnailFilename = `thumbnail--${Date.now()}.jpg`;
  const localThumbnailPath = path.join(workingDir, thumbnailFilename);
  const initPath = path.join(workingDir, 'init.mp4');
  const segmentPath = path.join(workingDir, 'segment.m4s');
  const playablePath = path.join(workingDir, 'playable.mp4');

  try {
    await createDirectory(workingDir);

    const { initUrl, segmentUrl, offsetInSegment } = await findCoveringSegment({
      playlistUrl: source,
      atSeconds: clampedSeconds,
      customRequestHeaders,
    });

    logger.debug(
      { atSeconds: clampedSeconds, offsetInSegment, segmentUrl },
      '[extractThumbnailAtTime] located covering segment',
    );

    await downloadFile(initUrl, initPath, customRequestHeaders);
    await downloadFile(segmentUrl, segmentPath, customRequestHeaders);
    await buildPlayableSegment({
      initPath,
      segmentPath,
      outputPath: playablePath,
    });

    // Seek by the ABSOLUTE media time, not `offsetInSegment`. Concatenating
    // init.mp4 + one .m4s does NOT rebase timestamps: fMP4/CMAF fragments keep
    // their `tfdt` baseMediaDecodeTime on the original media timeline, so the
    // covering segment's samples still live at their absolute PTS (e.g. a
    // segment starting at ~593.8s). Seeking to the in-segment offset would land
    // before the fragment's first frame and ffmpeg would clamp to the wrong
    // frame; `offsetInSegment` is kept only for segment selection + diagnostics.
    await takeScreenshotAtTime(
      playablePath,
      workingDir,
      thumbnailFilename,
      clampedSeconds,
    );

    const storagePath = `videos/${userId}/${videoId}/${thumbnailFilename}`;
    // Non-resumable: a thumbnail is tiny, and resumable uploads retry a
    // denied/blocked write instead of failing fast — turning a clean error
    // (e.g. missing bucket-write IAM) into a request-killing multi-minute hang.
    await uploadFile(localThumbnailPath, storagePath, {
      resumable: false,
      cacheControl: 'public, max-age=31536000',
    });

    return getDownloadUrl(storagePath);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw CustomError.medium('Failed to extract thumbnail at time', {
      originalError: error,
      errorCode: VIDEO_ERRORS.VIDEO_TAKE_SCREENSHOT_FAILED,
      context: { source, atSeconds: clampedSeconds, userId, videoId },
      source: ERROR_SOURCE,
    });
  } finally {
    await cleanupDirectory(workingDir);
  }
};

export { extractThumbnailAtTime, findCoveringSegment };
