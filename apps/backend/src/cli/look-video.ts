#!/usr/bin/env tsx

/**
 * CLI tool to INGEST a local video file into the Look library as a `type='video'`
 * photo:  ffprobe -> ffmpeg (-> fMP4 HLS) -> grab a poster frame -> upload HLS +
 * poster renditions to GCS -> insert the `photos` row.
 *
 * A Look video is "just another type of image" (modeled on Google Photos): it
 * lives in the SAME `photos` table as images, discriminated by `type`. The HLS
 * manifest URL is stored in the existing `source` column (exactly as the `videos`
 * table does), `duration` holds its length in seconds, and a poster frame drives
 * the grid thumbnail + blur-hash so a video renders like any other photo until it
 * is played.
 *
 * This is the video counterpart to `image.ts` (which ingests a still into the same
 * table). The transcode is the SHARED core — it calls the same `convertToHLS` the
 * compute convert handler and `convert.ts` use (fMP4/CMAF: playlist.m3u8 +
 * init.mp4 + .m4s), so the output format can never drift. The only things that
 * differ from `convert.ts` are the storage path (`photos/…` not `videos/…`) and
 * the target table (`photos` with `type='video'`, not `videos`).
 *
 * Setup reuses the same `~/.sworld-cli/config.json` as the other CLIs (gcp-key,
 * gcp-bucket, hasura-endpoint, hasura-secret, user-id). Configure it once via
 * `stream-m3u8.ts config set <key> <value>`.
 *
 * Usage:
 *   npx tsx src/cli/look-video.ts --file ./clip.mp4 [options]
 *   npx tsx src/cli/look-video.ts --dir ./clips --album 'Summer' [options]
 */

import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import { rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { type Bucket, Storage } from '@google-cloud/storage';
import { encode } from 'blurhash';
import { slugify } from 'core/universal/common';
import ffmpeg from 'fluent-ffmpeg';
import { GraphQLClient } from 'graphql-request';
import sharp from 'sharp';
// The transcode itself is the SHARED core — the exact same function the compute
// convert handler runs (so the output format can never drift). Only the
// CLI-specific plumbing (local temp dir, GCS key, poster, insert) lives here.
import { convertToHLS } from 'src/services/videos/helpers/ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { flushThenExit } from './cli-exit';

// ffmpeg itself resolves from PATH (the shared helper no longer bundles an npm
// binary — SWO-637); we still point fluent-ffmpeg at the bundled ffprobe here
// for the duration/metadata probe below.
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// ─── Constants ──────────────────────────────────────────────────────────────

const CACHE_CONTROL = 'public, max-age=31536000';
const PLAYLIST_NAME = 'playlist.m3u8';
/** Poster rendition filenames written alongside the HLS output in GCS. */
const POSTER_MEDIUM_NAME = 'medium.jpg';
const POSTER_THUMB_NAME = 'thumb.jpg';
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

/** Filename for the poster frame grabbed from the source video. */
const FRAME_NAME = 'frame.jpg';

// ─── Config (reads the shared CLI config; configure via stream-m3u8.ts) ───────

const CONFIG_FILE = path.join(os.homedir(), '.sworld-cli', 'config.json');

interface CliConfig {
  'user-id'?: string;
  'gcp-key'?: string;
  'gcp-bucket'?: string;
  'hasura-endpoint'?: string;
  'hasura-secret'?: string;
  concurrency?: number;
}

const loadConfig = (): CliConfig => {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
};

const resolveValue = (
  flagValue: string | undefined,
  envKey: string,
  configKey: keyof CliConfig,
  config: CliConfig,
): string | undefined =>
  flagValue || process.env[envKey] || (config[configKey] as string);

// ─── Argument parsing ────────────────────────────────────────────────────────

interface VideoArgs {
  file?: string;
  dir?: string;
  album?: string;
  slug?: string;
  isPublic: boolean;
  userId: string;
  skipDb: boolean;
  dryRun: boolean;
  concurrency: number;
  gcpKeyPath?: string;
  gcpBucket: string;
  hasuraEndpoint: string;
  hasuraSecret: string;
}

const parseVideoArgs = (rawArgs: string[]): VideoArgs => {
  const get = (flag: string): string | undefined => {
    const idx = rawArgs.indexOf(flag);
    if (idx === -1) return undefined;
    const value = rawArgs[idx + 1];
    // A missing value (end of args, or another --flag) is treated as unset, not
    // silently swallowing the next flag as this one's value.
    return value && !value.startsWith('--') ? value : undefined;
  };
  const has = (flag: string): boolean => rawArgs.includes(flag);

  const config = loadConfig();

  // Local-file only — reject remote sources loudly.
  if (get('--url')) {
    console.error(
      'Error: --url is not supported. Ingest a local file with --file <path> or --dir <path>.',
    );
    process.exit(1);
  }

  const file = get('--file');
  const dir = get('--dir');
  if (file && dir) {
    console.error('Error: use --file OR --dir, not both.');
    process.exit(1);
  }
  if (!file && !dir) {
    console.error('Error: a --file <path> or --dir <path> is required.');
    process.exit(1);
  }
  if (file && !existsSync(file)) {
    console.error(`Error: File not found: ${file}`);
    process.exit(1);
  }
  if (dir && !existsSync(dir)) {
    console.error(`Error: Directory not found: ${dir}`);
    process.exit(1);
  }
  // --slug names a single row, so it's meaningless (and unsafe — collisions) for
  // a whole directory. Reject the combination rather than silently ignoring it.
  if (dir && get('--slug')) {
    console.error('Error: --slug applies to a single --file, not --dir.');
    process.exit(1);
  }

  // Owner comes from --user-id > env > config. Never hardcoded in source.
  const userId = resolveValue(
    get('--user-id'),
    'DEFAULT_USER_ID',
    'user-id',
    config,
  );
  if (!userId) {
    console.error(
      'Error: user-id not configured. Set it with `stream-m3u8.ts config set user-id <uuid>`, or pass --user-id <uuid>.',
    );
    process.exit(1);
  }

  const gcpKeyPath = resolveValue(
    get('--gcp-key'),
    'GOOGLE_APPLICATION_CREDENTIALS',
    'gcp-key',
    config,
  );
  const gcpBucket =
    resolveValue(
      get('--gcp-bucket'),
      'GCP_STORAGE_BUCKET',
      'gcp-bucket',
      config,
    ) || '';
  const hasuraEndpoint =
    resolveValue(
      get('--hasura-endpoint'),
      'HASURA_ENDPOINT',
      'hasura-endpoint',
      config,
    ) || '';
  const hasuraSecret =
    resolveValue(
      get('--hasura-secret'),
      'HASURA_ADMIN_SECRET',
      'hasura-secret',
      config,
    ) || '';
  const concurrency = Number(get('--concurrency') || config.concurrency || '5');
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    console.error('Error: --concurrency must be a positive integer.');
    process.exit(1);
  }

  return {
    file,
    dir,
    // Normalize at the source: a blank/whitespace value is treated as unset.
    album: get('--album')?.trim() || undefined,
    slug: get('--slug')?.trim() || undefined,
    isPublic: has('--public'),
    userId,
    skipDb: has('--skip-db'),
    dryRun: has('--dry-run'),
    concurrency,
    gcpKeyPath,
    gcpBucket,
    hasuraEndpoint,
    hasuraSecret,
  };
};

// ─── Filename → metadata ─────────────────────────────────────────────────────

/** Collect the video files to ingest, from a single --file or every video in --dir. */
const collectFiles = (args: VideoArgs): string[] => {
  if (args.file) return [args.file];
  const dir = args.dir;
  if (!dir) return [];
  const files = readdirSync(dir)
    .filter(
      (name) =>
        VIDEO_EXTENSIONS.has(path.extname(name).toLowerCase()) &&
        statSync(path.join(dir, name)).isFile(),
    )
    .map((name) => path.join(dir, name))
    // Filename order (natural/numeric): this is the album ordering too (position
    // follows it), so `clip2` sorts before `clip10`, not after.
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length === 0) {
    throw new Error(
      `No video files (${[...VIDEO_EXTENSIONS].join(', ')}) found in ${dir}`,
    );
  }
  return files;
};

/** Derive the storage-safe slug from a file path. Also the dup-check key. */
const deriveSlug = (filePath: string): string => {
  const base = path.basename(filePath, path.extname(filePath)).trim();
  const slug = slugify(base);
  if (!slug) {
    throw new Error(`Could not derive a slug from "${filePath}".`);
  }
  return slug;
};

// ─── ffprobe (duration + date taken) ─────────────────────────────────────────

interface VideoMeta {
  /** Whole-second duration; finalizing a row with a bogus duration is worse than stopping. */
  duration: number;
  /** ISO date-taken: the container's creation_time if present, else the file's mtime. */
  takenAt: string;
}

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
      resolve({ duration: Math.floor(duration), takenAt });
    });
  });

// ─── HLS transcode (shared convertToHLS core) ────────────────────────────────

/**
 * Convert a local video to HLS into a fresh temp dir, delegating the actual
 * transcode to the SHARED `convertToHLS` core (same `videoConfig.ffmpegCommands`
 * the compute handler + convert.ts use → fMP4: playlist.m3u8 + init.mp4 + .m4s).
 * Only the temp-dir lifecycle is CLI-local. Returns the output dir and cleanup().
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
    // A mid-transcode failure would otherwise orphan the just-created dir — the
    // caller never gets a handle to clean it up because we never return.
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
 * frame path and cleanup().
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
    // Self-clean on failure — the caller never gets a handle to this dir.
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

// ─── GCS helpers ─────────────────────────────────────────────────────────────

const createStorage = (gcpKeyPath?: string): Storage =>
  gcpKeyPath ? new Storage({ keyFilename: gcpKeyPath }) : new Storage();

const getDownloadUrl = (bucket: string, storagePath: string): string =>
  `https://storage.googleapis.com/${bucket}/${storagePath}`;

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

// ─── Hasura ──────────────────────────────────────────────────────────────────

const makeClient = (args: VideoArgs): GraphQLClient =>
  new GraphQLClient(args.hasuraEndpoint, {
    headers: { 'x-hasura-admin-secret': args.hasuraSecret },
  });

const FIND_PHOTO_QUERY = `
  query FindPhoto($userId: uuid!, $slug: String!) {
    photos(where: { user_id: { _eq: $userId }, slug: { _eq: $slug } }, limit: 1) {
      id
    }
  }
`;

const CREATE_PHOTO_MUTATION = `
  mutation CreatePhoto($object: photos_insert_input!) {
    insert_photos_one(object: $object) { id }
  }
`;

const FIND_ALBUM_QUERY = `
  query FindAlbum($userId: uuid!, $slug: String!) {
    playlist(
      where: {
        user_id: { _eq: $userId }
        slug: { _eq: $slug }
        site: { _eq: "look" }
      }
      limit: 1
    ) {
      id
      title
    }
  }
`;

const CREATE_ALBUM_MUTATION = `
  mutation CreateAlbum($object: playlist_insert_input!) {
    insert_playlist_one(object: $object) { id }
  }
`;

const MAX_POSITION_QUERY = `
  query MaxPosition($playlistId: uuid!) {
    playlist_photos(
      where: { playlist_id: { _eq: $playlistId } }
      order_by: { position: desc }
      limit: 1
    ) {
      position
    }
  }
`;

const LINK_PHOTO_MUTATION = `
  mutation LinkPhoto($playlistId: uuid!, $photoId: uuid!, $position: Int!) {
    insert_playlist_photos_one(
      object: { playlist_id: $playlistId, photo_id: $photoId, position: $position }
    ) { playlist_id }
  }
`;

interface VideoPhotoRow {
  id: string;
  source: string;
  mediumUrl: string;
  thumbnailUrl: string;
  blurHash: string;
  width: number;
  height: number;
  duration: number;
  takenAt: string;
  slug: string;
}

/** True if this owner already has a photo with this slug. */
const photoExists = async (args: VideoArgs, slug: string): Promise<boolean> => {
  const data = await makeClient(args).request<{ photos: { id: string }[] }>(
    FIND_PHOTO_QUERY,
    { userId: args.userId, slug },
  );
  return data.photos.length > 0;
};

/** Insert one `type='video'` photos row (HLS manifest in `source`, poster + duration). */
const createVideoPhoto = async (
  args: VideoArgs,
  row: VideoPhotoRow,
): Promise<string> => {
  const data = await makeClient(args).request<{
    insert_photos_one: { id: string };
  }>(CREATE_PHOTO_MUTATION, {
    object: {
      id: row.id,
      type: 'video',
      source: row.source,
      mediumUrl: row.mediumUrl,
      thumbnailUrl: row.thumbnailUrl,
      blurHash: row.blurHash,
      width: row.width,
      height: row.height,
      duration: row.duration,
      takenAt: row.takenAt,
      slug: row.slug,
      user_id: args.userId,
      public: args.isPublic,
    },
  });
  return data.insert_photos_one.id;
};

/**
 * Find-or-create the `site='look'` album by slug, returning its id and the next
 * free position. The cover (`thumbnail_url`) is set to the first video's poster
 * thumb when the album is created — an existing album keeps its own cover.
 */
const resolveAlbum = async (
  args: VideoArgs,
  name: string,
  coverThumbUrl: string,
): Promise<{ id: string; nextPosition: number }> => {
  const client = makeClient(args);
  const slug = slugify(name);

  const found = await client.request<{
    playlist: { id: string; title: string }[];
  }>(FIND_ALBUM_QUERY, { userId: args.userId, slug });

  let albumId = found.playlist[0]?.id;
  if (albumId) {
    console.log(
      `  Reusing existing album "${found.playlist[0].title}" (slug: ${slug})`,
    );
  } else {
    const created = await client.request<{
      insert_playlist_one: { id: string };
    }>(CREATE_ALBUM_MUTATION, {
      object: {
        title: name,
        slug,
        site: 'look',
        user_id: args.userId,
        public: args.isPublic,
        thumbnailUrl: coverThumbUrl,
      },
    });
    albumId = created.insert_playlist_one.id;
    console.log(`  Created new album "${name}" (slug: ${slug})`);
  }

  // Append after whatever is already in the album, so re-runs keep order.
  const max = await client.request<{
    playlist_photos: { position: number }[];
  }>(MAX_POSITION_QUERY, { playlistId: albumId });
  const nextPosition = (max.playlist_photos[0]?.position ?? 0) + 1;
  return { id: albumId, nextPosition };
};

/** Link one video-photo into the album at `position`. */
const linkPhoto = async (
  args: VideoArgs,
  playlistId: string,
  photoId: string,
  position: number,
): Promise<void> => {
  await makeClient(args).request(LINK_PHOTO_MUTATION, {
    playlistId,
    photoId,
    position,
  });
};

// ─── Per-file ingest ─────────────────────────────────────────────────────────

type IngestOutcome = 'created' | 'skipped' | 'dry-run' | 'failed';

interface IngestResult {
  outcome: IngestOutcome;
  /** Present only when a photos row was actually inserted (drives album linking). */
  photo?: { id: string; thumbnailUrl: string };
}

/** Ingest one video: probe, dup-check, transcode, poster, upload, insert. */
const ingestOne = async (
  args: VideoArgs,
  bucket: Bucket | undefined,
  localFile: string,
  seenSlugs: Set<string>,
): Promise<IngestResult> => {
  const ext = path.extname(localFile).toLowerCase();
  if (!VIDEO_EXTENSIONS.has(ext)) {
    console.error(
      `  ✗ ${path.basename(localFile)}: unsupported extension ${ext}.`,
    );
    return { outcome: 'failed' };
  }

  let slug: string;
  try {
    slug = args.slug ?? deriveSlug(localFile);
  } catch (error) {
    console.error(
      `  ✗ ${path.basename(localFile)}: ${(error as Error).message}`,
    );
    return { outcome: 'failed' };
  }

  // Two different files can slugify to the same key. Since slug is the dup-check
  // key, the second would otherwise be silently swallowed as a "duplicate" and
  // its content lost — surface it loudly so the operator renames one instead.
  if (seenSlugs.has(slug)) {
    console.error(
      `  ✗ ${path.basename(localFile)}: slug "${slug}" collides with another file in this batch — rename to ingest both.`,
    );
    return { outcome: 'failed' };
  }
  seenSlugs.add(slug);

  const meta = await probeVideo(localFile);

  if (args.dryRun) {
    console.log(`  • ${path.basename(localFile)} (slug: ${slug})`);
    console.log(`      duration: ${meta.duration}s  taken_at: ${meta.takenAt}`);
    console.log(
      `      would transcode → HLS + poster → photos/${args.userId}/<photoId>/`,
    );
    console.log(
      `      would insert photos row type=video (public: ${args.isPublic})${args.album ? ` and link into album "${args.album}"` : ''}`,
    );
    return { outcome: 'dry-run' };
  }

  // Skip rather than create a duplicate for the same owner + slug.
  if (!args.skipDb && (await photoExists(args, slug))) {
    console.warn(`  ⚠ ${slug} — already exists, skipping.`);
    return { outcome: 'skipped' };
  }

  // bucket is only undefined on a dry run, which returned above.
  if (!bucket) throw new Error('Storage bucket not initialised.');

  const photoId = uuidv4();
  const dir = `photos/${args.userId}/${photoId}`;

  // 1. Transcode to HLS, then grab a poster frame. Each temp dir is cleaned in
  //    its own `finally` — nested so an `extractPosterFrame` failure still tears
  //    down the (already-transcoded) HLS dir instead of orphaning it.
  const hls = await convertLocalToHls(localFile);
  try {
    const frame = await extractPosterFrame(localFile, meta.duration);
    try {
      const poster = await buildPoster(readFileSync(frame.framePath));

      // 2. Upload the HLS bundle + the two poster renditions.
      const mediumPath = `${dir}/${POSTER_MEDIUM_NAME}`;
      const thumbPath = `${dir}/${POSTER_THUMB_NAME}`;
      const hlsCount = await uploadDir(
        bucket,
        hls.outputDir,
        dir,
        args.concurrency,
      );
      await Promise.all([
        uploadBuffer(bucket, poster.medium, mediumPath, 'image/jpeg'),
        uploadBuffer(bucket, poster.thumb, thumbPath, 'image/jpeg'),
      ]);
      console.log(`  ↑ ${dir}/ (${hlsCount} HLS files + poster medium/thumb)`);

      const thumbnailUrl = getDownloadUrl(args.gcpBucket, thumbPath);

      if (args.skipDb) {
        console.log(
          `  ✓ ${slug} (${poster.width}×${poster.height}, ${meta.duration}s, uploaded, DB skipped)`,
        );
        return { outcome: 'created' };
      }

      const id = await createVideoPhoto(args, {
        id: photoId,
        source: getDownloadUrl(args.gcpBucket, `${dir}/${PLAYLIST_NAME}`),
        mediumUrl: getDownloadUrl(args.gcpBucket, mediumPath),
        thumbnailUrl,
        blurHash: poster.blurHash,
        width: poster.width,
        height: poster.height,
        duration: meta.duration,
        takenAt: meta.takenAt,
        slug,
      });

      console.log(
        `  ✓ ${slug} (${poster.width}×${poster.height}, ${meta.duration}s) → ${id}`,
      );
      return { outcome: 'created', photo: { id, thumbnailUrl } };
    } finally {
      await frame.cleanup();
    }
  } finally {
    await hls.cleanup();
  }
};

// ─── Video command ─────────────────────────────────────────────────────────

const handleVideo = async (rawArgs: string[]): Promise<void> => {
  const args = parseVideoArgs(rawArgs);
  const files = collectFiles(args);

  console.log('=== Video Ingest (Look) ===');
  console.log(
    `  Source:     ${args.file ? args.file : `${args.dir} (${files.length} files)`}`,
  );
  console.log(`  User ID:    ${args.userId}`);
  console.log(`  Album:      ${args.album ?? '(none)'}`);
  console.log(`  GCP Bucket: ${args.gcpBucket}`);
  console.log(
    `  GCP Key:    ${args.gcpKeyPath ? path.basename(args.gcpKeyPath) : 'ADC (default)'}`,
  );
  console.log(`  Public:     ${args.isPublic}`);
  console.log(`  Dry run:    ${args.dryRun}`);
  console.log(`  Skip DB:    ${args.skipDb}`);
  console.log('');

  // Validate config the same way the other CLIs do.
  if (!args.dryRun && !args.gcpBucket) {
    console.error(
      'Error: gcp-bucket not configured. Run: config set gcp-bucket <bucket-name>',
    );
    process.exit(1);
  }
  if (
    !args.skipDb &&
    !args.dryRun &&
    (!args.hasuraEndpoint || !args.hasuraSecret)
  ) {
    console.error('Error: hasura-endpoint and hasura-secret not configured.');
    console.error('  Run: config set hasura-endpoint <url>');
    console.error('  Run: config set hasura-secret <secret>');
    process.exit(1);
  }

  const bucket = args.dryRun
    ? undefined
    : createStorage(args.gcpKeyPath).bucket(args.gcpBucket);

  if (args.album && args.skipDb) {
    console.warn(
      'Note: --album is ignored with --skip-db (no photos row is created to link).',
    );
  }

  // The album is resolved once, off the FIRST created video (whose poster thumb
  // becomes the album cover), then reused with a running position for the rest.
  let albumState: { id: string; nextPosition: number } | undefined;

  const tally: Record<IngestOutcome, number> = {
    created: 0,
    skipped: 0,
    'dry-run': 0,
    failed: 0,
  };
  // Guards against two different files in one batch slugifying to the same key.
  const seenSlugs = new Set<string>();

  for (const localFile of files) {
    // One bad file in a batch shouldn't abort the rest — record it and move on.
    try {
      const result = await ingestOne(args, bucket, localFile, seenSlugs);

      if (args.album && result.photo) {
        if (!albumState) {
          albumState = await resolveAlbum(
            args,
            args.album,
            result.photo.thumbnailUrl,
          );
        }
        await linkPhoto(
          args,
          albumState.id,
          result.photo.id,
          albumState.nextPosition,
        );
        albumState.nextPosition += 1;
      }

      // Count only after linking, so a link failure falls to the catch below
      // instead of double-counting the file as both created and failed.
      tally[result.outcome] += 1;
    } catch (error) {
      console.error(
        `  ✗ ${path.basename(localFile)}: ${(error as Error).message}`,
      );
      tally.failed += 1;
    }
  }

  console.log('');
  console.log('=== Done ===');
  console.log(
    `  Created: ${tally.created}  Skipped: ${tally.skipped}  Planned: ${tally['dry-run']}  Failed: ${tally.failed}`,
  );

  // Non-zero exit if any file failed, so a batch surfaces the failure.
  if (tally.failed > 0) {
    throw new Error(`${tally.failed} file(s) failed.`);
  }
};

// ─── Main Router ────────────────────────────────────────────────────────────

const main = (): void => {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--help' || command === '-h') {
    console.log('sworld-cli - Ingest a local video into the Look library');
    console.log('');
    console.log(
      'Transcodes a local video with ffmpeg (fMP4 HLS), grabs a poster',
    );
    console.log(
      'frame, uploads both to GCS, and inserts a type=video photos row.',
    );
    console.log(
      'Config is shared with the other CLIs (~/.sworld-cli/config.json).',
    );
    console.log('');
    console.log('Usage:');
    console.log('  look-video.ts --file ./clip.mp4 [options]');
    console.log("  look-video.ts --dir ./clips --album 'Summer' [options]");
    console.log('');
    console.log('Options:');
    console.log(
      '  --file <path>       Local video to ingest (.mp4/.mov/.m4v/.webm/.mkv/.avi)',
    );
    console.log(
      '  --dir <path>        Ingest every video in a folder (filename order)',
    );
    console.log(
      '  --slug <slug>       Slug for a single --file (default: from filename)',
    );
    console.log(
      "  --album <name>      Find-or-create a 'look' album and link each video",
    );
    console.log(
      '  --public            Mark the video(s) public (default: private)',
    );
    console.log(
      '  --concurrency <n>   Parallel HLS segment uploads (default: 5)',
    );
    console.log(
      '  --dry-run           Show what would happen, no transcode/uploads/DB writes',
    );
    console.log(
      '  --skip-db           Transcode + upload to GCS but skip the Hasura insert',
    );
    console.log(
      '  --user-id <uuid>    Owner (from --user-id > env > config user-id)',
    );
    return;
  }

  handleVideo(args)
    // Exit explicitly on success — GCS/ffmpeg keep-alive sockets can otherwise
    // keep the event loop alive for minutes, hanging any batch that waits on this
    // process. flushThenExit drains stdio first so output isn't truncated.
    .then(() => flushThenExit(0))
    .catch((error) => {
      console.error('');
      console.error('=== Error ===');
      console.error(error.message || error);
      if (error.response) {
        console.error('Response:', JSON.stringify(error.response, null, 2));
      }
      flushThenExit(1);
    });
};

main();
