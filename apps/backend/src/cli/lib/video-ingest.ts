/**
 * Shared video-ingest pipeline for the Look CLIs.
 *
 * A Look video is "just another type of image": it lives in the same `photos`
 * table as a still, discriminated by `type='video'`, with the HLS manifest URL in
 * `source`, a poster frame driving the grid thumbnail + blur-hash, and `duration`
 * in seconds. Turning a local video file into those GCS assets is identical work
 * whether the source is a bare `--file` (look-video.ts) or a video sitting inside a
 * Google Photos Takeout export (google-photos.ts) — so that work lives here, once.
 *
 * The transcode itself is the SHARED core: `processVideoToStorage` calls the very
 * same `convertToHLS` the compute convert handler and `convert.ts` use (fMP4/CMAF:
 * playlist.m3u8 + init.mp4 + .m4s), so the output format can never drift. Only the
 * CLI-side plumbing — local temp dirs, poster frame, GCS upload, URL shapes — is
 * here. Everything above the storage layer (dup-check, the `insert_photos_one` row,
 * album linking, which date wins) stays in each CLI, because those differ per tool
 * (e.g. Takeout resolves the date from a sidecar, not the container).
 *
 * This module is pure library code: no CLI side effects, no `main()`, no reads of
 * `process.argv` or the shared config — every dependency is passed in explicitly,
 * so it is safe to `import` from any CLI without executing anything.
 */

import { mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import type { Bucket } from '@google-cloud/storage';
import { encode } from 'blurhash';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
// The transcode is the SHARED core — the exact function the compute convert
// handler runs (so the output format can never drift). convertToHLS sets the
// ffmpeg binary path on the fluent-ffmpeg singleton at its module load; we set
// ffprobe here for the duration/metadata probe below.
import { convertToHLS } from 'src/services/videos/helpers/ffmpeg';

ffmpeg.setFfprobePath(ffprobeInstaller.path);

// ─── Constants ──────────────────────────────────────────────────────────────

const CACHE_CONTROL = 'public, max-age=31536000';
/** The HLS manifest filename `convertToHLS` writes; stored in `photos.source`. */
const PLAYLIST_NAME = 'playlist.m3u8';
/** Poster rendition filenames written alongside the HLS output in GCS. */
const POSTER_MEDIUM_NAME = 'medium.jpg';
const POSTER_THUMB_NAME = 'thumb.jpg';
/** Filename for the poster frame grabbed from the source video. */
const FRAME_NAME = 'frame.jpg';

/** Video containers ffmpeg can transcode for the Look library. */
const VIDEO_EXTENSIONS = new Set([
  '.mp4',
  '.mov',
  '.m4v',
  '.webm',
  '.mkv',
  '.avi',
]);

/** Longest-edge caps for the two poster renditions (px), mirroring image.ts. */
const THUMB_MAX_EDGE = 300;
const MEDIUM_MAX_EDGE = 1200;
/** Blur-hash: downscale to this longest edge, then encode with 4x4 components. */
const BLURHASH_MAX_EDGE = 32;
const BLURHASH_COMPONENTS_X = 4;
const BLURHASH_COMPONENTS_Y = 4;

/** Default parallel HLS-segment uploads when a caller doesn't specify. */
const DEFAULT_UPLOAD_CONCURRENCY = 5;

/**
 * Per-extension content types for the HLS output. GCS auto-detection doesn't
 * know `.m4s`, so we set them explicitly here (the convert output is fMP4).
 */
const CONTENT_TYPES: Record<string, string> = {
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.m4s': 'video/iso.segment',
  '.mp4': 'video/mp4',
  '.ts': 'video/mp2t',
};

/** True when a file's extension is a video container this pipeline can ingest. */
const isVideoFile = (filePath: string): boolean =>
  VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase());

// ─── ffprobe (duration + date taken) ─────────────────────────────────────────

interface VideoMeta {
  /** Whole-second duration; finalizing a row with a bogus duration is worse than stopping. */
  duration: number;
  /** ISO date-taken: the container's creation_time if present, else the file's mtime. */
  takenAt: string;
}

/**
 * Probe a video for its duration and best-effort capture date. The date is a
 * fallback only — a caller with a better source (e.g. a Takeout sidecar) should
 * prefer its own and ignore `takenAt`.
 */
const probeVideo = (inputPath: string): Promise<VideoMeta> =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(new Error(`ffprobe failed for ${inputPath}: ${err.message}`));
        return;
      }
      const duration = metadata?.format?.duration;
      if (!duration) {
        reject(new Error(`Could not determine duration for ${inputPath}`));
        return;
      }
      // Prefer the container's recorded capture time; fall back to the file mtime
      // (many downloaded/exported clips carry no creation_time tag).
      const creationTime = metadata?.format?.tags?.creation_time;
      const parsed =
        typeof creationTime === 'string' ? new Date(creationTime) : undefined;
      const takenAt =
        parsed && !Number.isNaN(parsed.getTime())
          ? parsed.toISOString()
          : statSync(inputPath).mtime.toISOString();
      // Floor to whole seconds, but never below 1 for a real clip: a sub-second
      // video (0 < d < 1) passed the truthiness guard above, and flooring it to 0
      // would finalize the "bogus duration" the guard exists to prevent (and hide
      // the duration badge in the UI). Clamp to a 1s minimum instead.
      resolve({ duration: Math.max(1, Math.floor(duration)), takenAt });
    });
  });

// ─── HLS transcode + poster frame (self-cleaning temp dirs) ──────────────────

/**
 * Convert a local video to HLS into a fresh temp dir, delegating the actual
 * transcode to the SHARED `convertToHLS` core. Only the temp-dir lifecycle is
 * CLI-local. Returns the output dir and a cleanup(); self-cleans on failure so a
 * mid-transcode error never orphans the just-created dir.
 */
const convertLocalToHls = async (
  inputPath: string,
): Promise<{ outputDir: string; cleanup: () => Promise<void> }> => {
  // mkdtemp creates the dir (convertToHLS writes playlist.m3u8 into it but does
  // not create it). convertToHLS requires absolute input + output paths.
  const outputDir = mkdtempSync(path.join(os.tmpdir(), 'sworld-look-video-'));
  try {
    await convertToHLS(path.resolve(inputPath), outputDir);
  } catch (error) {
    await rm(outputDir, { recursive: true, force: true });
    throw error;
  }
  return {
    outputDir,
    cleanup: async () => {
      await rm(outputDir, { recursive: true, force: true });
    },
  };
};

/**
 * Grab a single JPEG frame from the source video as the poster. Written to a
 * standalone temp dir (NOT the HLS output dir) so it is never uploaded verbatim —
 * only the derived medium/thumb renditions are. `atSeconds` is clamped below the
 * duration so we never seek past the end (which yields no frame). Returns the
 * frame path and cleanup(); self-cleans on failure.
 */
const extractPosterFrame = async (
  inputPath: string,
  duration: number,
): Promise<{ framePath: string; cleanup: () => Promise<void> }> => {
  const frameDir = mkdtempSync(path.join(os.tmpdir(), 'sworld-look-poster-'));
  const at = Math.min(1, Math.max(duration - 1, 0));
  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .on('end', () => resolve())
        .on('error', (err) =>
          reject(new Error(`Poster extraction failed: ${err.message}`)),
        )
        .screenshots({
          timestamps: [at],
          filename: FRAME_NAME,
          folder: frameDir,
        });
    });
  } catch (error) {
    await rm(frameDir, { recursive: true, force: true });
    throw error;
  }
  return {
    framePath: path.join(frameDir, FRAME_NAME),
    cleanup: async () => {
      await rm(frameDir, { recursive: true, force: true });
    },
  };
};

// ─── Poster renditions (sharp + blurhash), mirroring image.ts ────────────────

interface Poster {
  width: number;
  height: number;
  blurHash: string;
  medium: Buffer;
  thumb: Buffer;
}

/** Resize longest edge to `maxEdge`, preserving aspect ratio, never upscaling. */
const resizeLongestEdge = (input: Buffer, maxEdge: number): Promise<Buffer> =>
  sharp(input)
    .resize(maxEdge, maxEdge, { fit: 'inside', withoutEnlargement: true })
    .jpeg()
    .toBuffer();

/** Encode a blur-hash from a tiny downscaled RGBA version of the frame. */
const encodeBlurHash = async (input: Buffer): Promise<string> => {
  const { data, info } = await sharp(input)
    .raw()
    .ensureAlpha()
    .resize(BLURHASH_MAX_EDGE, BLURHASH_MAX_EDGE, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });
  return encode(
    new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
    info.width,
    info.height,
    BLURHASH_COMPONENTS_X,
    BLURHASH_COMPONENTS_Y,
  );
};

/** Read dimensions + generate the medium, thumb, and blur-hash from a poster frame. */
const buildPoster = async (frame: Buffer): Promise<Poster> => {
  const meta = await sharp(frame).metadata();
  if (!meta.width || !meta.height) {
    throw new Error('Could not read poster frame dimensions.');
  }
  // The frame comes straight out of ffmpeg at the video's display resolution, so
  // its pixel dimensions ARE the video's — no EXIF orientation to reconcile.
  const [medium, thumb, blurHash] = await Promise.all([
    resizeLongestEdge(frame, MEDIUM_MAX_EDGE),
    resizeLongestEdge(frame, THUMB_MAX_EDGE),
    encodeBlurHash(frame),
  ]);
  return { width: meta.width, height: meta.height, blurHash, medium, thumb };
};

// ─── GCS upload helpers ──────────────────────────────────────────────────────

const getDownloadUrl = (bucketName: string, storagePath: string): string =>
  `https://storage.googleapis.com/${bucketName}/${storagePath}`;

/** Upload every file in a flat directory to `storagePath/`, with correct content-types. */
const uploadDir = async (
  bucket: Bucket,
  localDir: string,
  storagePath: string,
  concurrency: number,
): Promise<number> => {
  const files = readdirSync(localDir).filter((name) =>
    statSync(path.join(localDir, name)).isFile(),
  );
  let next = 0;
  const worker = async () => {
    while (next < files.length) {
      const name = files[next++];
      const contentType = CONTENT_TYPES[path.extname(name).toLowerCase()];
      await bucket.upload(path.join(localDir, name), {
        destination: `${storagePath}/${name}`,
        resumable: false,
        metadata: {
          cacheControl: CACHE_CONTROL,
          ...(contentType ? { contentType } : {}),
        },
      });
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, files.length) }, worker),
  );
  return files.length;
};

/** Upload one in-memory rendition buffer to `storagePath`. */
const uploadBuffer = async (
  bucket: Bucket,
  buffer: Buffer,
  storagePath: string,
  contentType: string,
): Promise<void> => {
  await bucket.file(storagePath).save(buffer, {
    resumable: false,
    metadata: { cacheControl: CACHE_CONTROL, contentType },
  });
};

// ─── The whole storage pipeline ──────────────────────────────────────────────

interface ProcessVideoOptions {
  bucket: Bucket;
  /** Bucket name for building the public download URLs (bucket.name isn't relied on). */
  bucketName: string;
  /** Absolute or relative path to the local source video. */
  inputPath: string;
  /** GCS prefix for this photo's assets, e.g. `photos/<userId>/<photoId>`. */
  storageDir: string;
  /** Parallel HLS-segment uploads. Defaults to 5. */
  concurrency?: number;
}

interface ProcessVideoResult {
  /** HLS manifest URL → `photos.source`. */
  source: string;
  mediumUrl: string;
  thumbnailUrl: string;
  blurHash: string;
  width: number;
  height: number;
  duration: number;
  /** Container/mtime capture date; a caller with a better date should ignore this. */
  probedTakenAt: string;
  /** Number of HLS files uploaded (for the operator log). */
  hlsFileCount: number;
}

/**
 * Transcode one local video to HLS, grab a poster, and upload the HLS bundle plus
 * the medium/thumb poster renditions under `storageDir`. Returns the resulting GCS
 * URLs and the probed duration/date. Does NOT touch Hasura — the caller owns the
 * `photos` row, so it can apply its own date source, public flag, slug, and album.
 *
 * Temp dirs are nested-cleaned: an `extractPosterFrame` failure still tears down
 * the already-transcoded HLS dir instead of orphaning it.
 */
const processVideoToStorage = async (
  opts: ProcessVideoOptions,
): Promise<ProcessVideoResult> => {
  const { bucket, bucketName, inputPath, storageDir } = opts;
  const concurrency = opts.concurrency ?? DEFAULT_UPLOAD_CONCURRENCY;

  const meta = await probeVideo(inputPath);

  const hls = await convertLocalToHls(inputPath);
  try {
    const frame = await extractPosterFrame(inputPath, meta.duration);
    try {
      const poster = await buildPoster(readFileSync(frame.framePath));

      const mediumPath = `${storageDir}/${POSTER_MEDIUM_NAME}`;
      const thumbPath = `${storageDir}/${POSTER_THUMB_NAME}`;
      const hlsFileCount = await uploadDir(
        bucket,
        hls.outputDir,
        storageDir,
        concurrency,
      );
      await Promise.all([
        uploadBuffer(bucket, poster.medium, mediumPath, 'image/jpeg'),
        uploadBuffer(bucket, poster.thumb, thumbPath, 'image/jpeg'),
      ]);

      return {
        source: getDownloadUrl(bucketName, `${storageDir}/${PLAYLIST_NAME}`),
        mediumUrl: getDownloadUrl(bucketName, mediumPath),
        thumbnailUrl: getDownloadUrl(bucketName, thumbPath),
        blurHash: poster.blurHash,
        width: poster.width,
        height: poster.height,
        duration: meta.duration,
        probedTakenAt: meta.takenAt,
        hlsFileCount,
      };
    } finally {
      await frame.cleanup();
    }
  } finally {
    await hls.cleanup();
  }
};

export {
  isVideoFile,
  probeVideo,
  processVideoToStorage,
  VIDEO_EXTENSIONS,
  type ProcessVideoResult,
  type VideoMeta,
};
