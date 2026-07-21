#!/usr/bin/env tsx

/**
 * CLI tool to CONVERT a local video file to HLS and publish it:
 *   ffprobe -> ffmpeg (-> fMP4 HLS) -> upload to GCS -> create/finalize the videos row.
 *
 * This is the operator-local counterpart to the compute `convert` flow (mp4 ->
 * HLS). Unlike `stream-m3u8.ts` (which is UPDATE-only), this tool CREATES the
 * `videos` row when it doesn't exist, folding the manual "insert row first" step
 * into the command.
 *
 * The transcode is the SHARED core — it calls the same `convertToHLS` the compute
 * convert handler uses (which reads `videoConfig.ffmpegCommands`), so the output
 * format can never drift (fMP4/CMAF: playlist.m3u8 + init.mp4 + .m4s). Only the
 * CLI plumbing (local temp dir, GCS key, create/finalize) lives in this file.
 *
 * Setup reuses the same `~/.sworld-cli/config.json` as `stream-m3u8.ts`
 * (gcp-key, gcp-bucket, hasura-endpoint, hasura-secret, user-id). Configure it
 * once via `stream-m3u8.ts config set <key> <value>`.
 *
 * Usage:
 *   npx tsx src/cli/convert.ts convert --file ./movie.mp4 --title 'Movie' [options]
 *   npx tsx src/cli/convert.ts convert --file ./ep01.mp4 --video-id <uuid>   # finalize existing
 */

import { randomUUID } from 'node:crypto';
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
import { createInterface } from 'node:readline/promises';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { type Bucket, Storage } from '@google-cloud/storage';
import { slugify } from 'core/universal/common';
import ffmpeg from 'fluent-ffmpeg';
import { GraphQLClient } from 'graphql-request';
import { nanoid } from 'nanoid';
// The transcode itself is the SHARED core — the exact same function the compute
// convert handler runs (so the output format can never drift). Only the
// CLI-specific plumbing (local temp dir, GCS key, create/finalize) lives here.
import { convertToHLS } from 'src/services/videos/helpers/ffmpeg';
import { uploadThumbnailFromUrl } from 'src/services/videos/helpers/thumbnail-from-url';
import { flushThenExit } from './cli-exit';

// convertToHLS (imported above) sets the ffmpeg binary path on the shared
// fluent-ffmpeg singleton at its module load; we set ffprobe here for the
// duration probe below.
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// ─── Constants ──────────────────────────────────────────────────────────────

const PLAYLIST_NAME = 'playlist.m3u8';
const CACHE_CONTROL = 'public, max-age=31536000';

/**
 * Per-extension content types for the HLS output. GCS auto-detection doesn't
 * know `.m4s`, so we set them explicitly here (the convert output is fMP4).
 */
const CONTENT_TYPES: Record<string, string> = {
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.m4s': 'video/iso.segment',
  '.mp4': 'video/mp4',
  '.ts': 'video/mp2t',
  // A frame grabbed from the source (--thumbnail-from-video) is written into the
  // same output dir and uploaded with the HLS files, so it needs a content-type too.
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

/** Filename for a frame extracted from the source video (--thumbnail-from-video). */
const VIDEO_THUMBNAIL_NAME = 'thumbnail.jpg';

// ─── Interactive prompt ──────────────────────────────────────────────────────

const prompt = async (question: string, defaultValue = ''): Promise<string> => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(question)).trim();
    return answer || defaultValue;
  } finally {
    rl.close();
  }
};

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

interface ConvertArgs {
  file: string;
  videoId?: string;
  title?: string;
  slug?: string;
  videoUrl?: string;
  thumbnail?: string;
  thumbnailReferer?: string;
  thumbnailFromVideo: boolean;
  thumbnailAt?: number;
  isPublic: boolean;
  userId: string;
  skipDb: boolean;
  dryRun: boolean;
  standalone: boolean;
  concurrency: number;
  playlistName?: string;
  position?: number;
  gcpKeyPath?: string;
  gcpBucket: string;
  hasuraEndpoint: string;
  hasuraSecret: string;
}

const parseConvertArgs = (rawArgs: string[]): ConvertArgs => {
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

  // V1 is local-file only — reject remote sources loudly.
  if (get('--url')) {
    console.error(
      'Error: --url is not supported in V1. Convert a local file with --file <path>.',
    );
    process.exit(1);
  }

  const file = get('--file') || '';
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

  const positionFlag = get('--position');
  const position =
    positionFlag !== undefined ? Number(positionFlag) : undefined;
  if (position !== undefined && !Number.isInteger(position)) {
    console.error('Error: --position must be an integer.');
    process.exit(1);
  }

  // --thumbnail (re-host a URL) and --thumbnail-from-video (grab a source frame)
  // are mutually exclusive — they both target the same thumbnail slot.
  const thumbnailFromVideo = has('--thumbnail-from-video');
  if (thumbnailFromVideo && get('--thumbnail')) {
    console.error(
      'Error: --thumbnail and --thumbnail-from-video are mutually exclusive.',
    );
    process.exit(1);
  }
  const thumbnailAtFlag = get('--thumbnail-at');
  const thumbnailAt =
    thumbnailAtFlag !== undefined ? Number(thumbnailAtFlag) : undefined;
  if (
    thumbnailAt !== undefined &&
    (!Number.isFinite(thumbnailAt) || thumbnailAt < 0)
  ) {
    console.error(
      'Error: --thumbnail-at must be a non-negative number (seconds).',
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
    videoId: get('--video-id'),
    // Normalize at the source: a blank/whitespace title is treated as unset, so
    // every downstream check + the insert see a real title or nothing.
    title: get('--title')?.trim() || undefined,
    slug: get('--slug'),
    videoUrl: get('--video-url'),
    thumbnail: get('--thumbnail'),
    thumbnailReferer: get('--thumbnail-referer'),
    thumbnailFromVideo,
    thumbnailAt,
    isPublic: has('--public'),
    userId,
    skipDb: has('--skip-db'),
    dryRun: has('--dry-run'),
    standalone: has('--standalone'),
    concurrency,
    playlistName: get('--playlist'),
    position,
    gcpKeyPath,
    gcpBucket,
    hasuraEndpoint,
    hasuraSecret,
  };
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

// ─── ffmpeg / ffprobe ────────────────────────────────────────────────────────

const getDuration = (inputPath: string): Promise<number> =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      // Fail loud rather than fabricating a duration — finalizing a row with a
      // bogus duration is worse than stopping and telling the operator.
      if (err) {
        reject(new Error(`ffprobe failed for ${inputPath}: ${err.message}`));
        return;
      }
      const duration = metadata?.format?.duration;
      if (!duration) {
        reject(new Error(`Could not determine duration for ${inputPath}`));
        return;
      }
      resolve(Math.floor(duration));
    });
  });

/**
 * Convert a local video to HLS into a fresh temp dir, delegating the actual
 * transcode to the SHARED `convertToHLS` core (same `videoConfig.ffmpegCommands`
 * the compute handler uses → fMP4: playlist.m3u8 + init.mp4 + .m4s). Only the
 * temp-dir lifecycle is CLI-local. Returns the output dir and a cleanup().
 */
const convertLocalToHls = async (
  inputPath: string,
): Promise<{ outputDir: string; cleanup: () => Promise<void> }> => {
  // mkdtemp creates the dir (convertToHLS writes playlist.m3u8 into it but does
  // not create it). convertToHLS requires absolute input + output paths.
  const outputDir = mkdtempSync(path.join(os.tmpdir(), 'sworld-convert-'));
  await convertToHLS(path.resolve(inputPath), outputDir);
  return {
    outputDir,
    cleanup: async () => {
      await rm(outputDir, { recursive: true, force: true });
    },
  };
};

/**
 * Grab a single JPEG frame from the source video into `outputDir/thumbnail.jpg`.
 * Written into the SAME dir as the HLS output so it's uploaded by `uploadDir`
 * alongside the segments (one upload pass, correct content-type). `atSeconds` is
 * clamped below the duration so we never seek past the end (which yields no frame).
 */
const extractThumbnail = (
  inputPath: string,
  outputDir: string,
  atSeconds: number,
): Promise<string> =>
  new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .on('end', () => resolve(path.join(outputDir, VIDEO_THUMBNAIL_NAME)))
      .on('error', (err) =>
        reject(new Error(`Thumbnail extraction failed: ${err.message}`)),
      )
      .screenshots({
        timestamps: [atSeconds],
        filename: VIDEO_THUMBNAIL_NAME,
        folder: outputDir,
      });
  });

// ─── Hasura ──────────────────────────────────────────────────────────────────

const makeClient = (args: ConvertArgs): GraphQLClient =>
  new GraphQLClient(args.hasuraEndpoint, {
    headers: { 'x-hasura-admin-secret': args.hasuraSecret },
  });

const GET_VIDEO_QUERY = `
  query GetVideo($videoId: uuid!) {
    videos_by_pk(id: $videoId) { id }
  }
`;

const CREATE_VIDEO_MUTATION = `
  mutation CreateVideo($object: videos_insert_input!) {
    insert_videos_one(object: $object) { id }
  }
`;

const FINALIZE_VIDEO_MUTATION = `
  mutation FinalizeVideo($videoId: uuid!, $videoUpdates: videos_set_input!) {
    update_videos_by_pk(pk_columns: { id: $videoId }, _set: $videoUpdates) { id }
  }
`;

/** True if a row with this id already exists. */
const videoExists = async (
  args: ConvertArgs,
  videoId: string,
): Promise<boolean> => {
  const data = await makeClient(args).request<{
    videos_by_pk: { id: string } | null;
  }>(GET_VIDEO_QUERY, { videoId });
  return Boolean(data.videos_by_pk);
};

/** Insert a new videos row (status processing, skip_process so the auto-pipeline no-ops). */
const createVideo = async (
  args: ConvertArgs,
  videoId: string,
): Promise<void> => {
  const title = args.title!.trim();
  await makeClient(args).request(CREATE_VIDEO_MUTATION, {
    object: {
      id: videoId,
      title,
      slug: args.slug?.trim() || slugify(title),
      // video_url is the "original source". A local convert has none, so default
      // to a non-path sentinel — never the operator's absolute filesystem path.
      video_url: args.videoUrl || `local:${path.basename(args.file)}`,
      user_id: args.userId,
      skip_process: true,
      status: 'processing',
      public: args.isPublic,
    },
  });
};

/** Finalize: point source at the playlist, mark ready, set duration + sId. */
const finalizeVideo = async (
  args: ConvertArgs,
  videoId: string,
  playlistUrl: string,
  duration: number,
  thumbnailUrl?: string,
): Promise<string> => {
  const sId = nanoid(11);
  await makeClient(args).request(FINALIZE_VIDEO_MUTATION, {
    videoId,
    videoUpdates: {
      source: playlistUrl,
      status: 'ready',
      duration,
      sId,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
    },
  });
  return sId;
};

// ─── Playlist linking (mirrors stream-m3u8.ts) ───────────────────────────────

const FIND_PLAYLIST_QUERY = `
  query FindPlaylist($userId: uuid!, $slug: String!) {
    playlist(where: { user_id: { _eq: $userId }, slug: { _eq: $slug } }, limit: 1) {
      id
      title
    }
  }
`;

const CREATE_PLAYLIST_MUTATION = `
  mutation CreatePlaylist($title: String!, $slug: String!, $userId: uuid!) {
    insert_playlist_one(object: { title: $title, slug: $slug, user_id: $userId }) { id }
  }
`;

const GET_LINK_QUERY = `
  query GetLink($playlistId: uuid!, $videoId: uuid!) {
    playlist_videos_by_pk(playlist_id: $playlistId, video_id: $videoId) { playlist_id }
  }
`;

const MAX_POSITION_QUERY = `
  query MaxPosition($playlistId: uuid!) {
    playlist_videos(
      where: { playlist_id: { _eq: $playlistId } }
      order_by: { position: desc }
      limit: 1
    ) { position }
  }
`;

const LINK_VIDEO_MUTATION = `
  mutation LinkVideo($playlistId: uuid!, $videoId: uuid!, $position: Int!) {
    insert_playlist_videos_one(
      object: { playlist_id: $playlistId, video_id: $videoId, position: $position }
    ) { playlist_id }
  }
`;

/** Find-or-create the playlist by slug, then link the video (error if already linked). */
const attachToPlaylist = async (
  args: ConvertArgs,
  videoId: string,
): Promise<void> => {
  const client = makeClient(args);
  const name = args.playlistName!.trim();
  const slug = slugify(name);

  const found = await client.request<{
    playlist: { id: string; title: string }[];
  }>(FIND_PLAYLIST_QUERY, { userId: args.userId, slug });

  let playlistId = found.playlist[0]?.id;
  if (playlistId) {
    console.log(
      `  Reusing existing playlist "${found.playlist[0].title}" (slug: ${slug})`,
    );
  } else {
    const created = await client.request<{
      insert_playlist_one: { id: string };
    }>(CREATE_PLAYLIST_MUTATION, { title: name, slug, userId: args.userId });
    playlistId = created.insert_playlist_one.id;
    console.log(`  Created new playlist "${name}" (slug: ${slug})`);
  }

  const existing = await client.request<{
    playlist_videos_by_pk: { playlist_id: string } | null;
  }>(GET_LINK_QUERY, { playlistId, videoId });
  if (existing.playlist_videos_by_pk) {
    throw new Error(
      `Video ${videoId} is already in playlist "${name}" (slug: ${slug}).`,
    );
  }

  let position = args.position;
  if (position === undefined) {
    const max = await client.request<{
      playlist_videos: { position: number }[];
    }>(MAX_POSITION_QUERY, { playlistId });
    position = (max.playlist_videos[0]?.position ?? 0) + 1;
  }

  await client.request(LINK_VIDEO_MUTATION, { playlistId, videoId, position });
  console.log(`  Linked at position ${position}.`);
};

// ─── Convert command ─────────────────────────────────────────────────────────

const handleConvert = async (rawArgs: string[]) => {
  const args = parseConvertArgs(rawArgs);
  const interactive = Boolean(process.stdin.isTTY);

  // Gather missing essentials interactively when run from a terminal.
  if (!args.file && interactive) {
    args.file = await prompt('Local video file path: ');
  }
  if (!args.file) {
    console.error('Error: --file <path> is required.');
    process.exit(1);
  }
  if (!existsSync(args.file)) {
    console.error(`Error: file not found: ${args.file}`);
    process.exit(1);
  }

  // Decide create-vs-update. The row exists only when an id is given AND found.
  // The check is a read-only query, so it runs in dry-run too (when creds are
  // present) — that keeps the dry-run plan honest about create vs finalize.
  const hasHasuraCreds = Boolean(args.hasuraEndpoint && args.hasuraSecret);
  const existenceKnown =
    !args.skipDb && Boolean(args.videoId) && hasHasuraCreds;
  const willUpdateExisting =
    existenceKnown && (await videoExists(args, args.videoId as string));
  const videoId = args.videoId || randomUUID();
  const mustCreate = !args.skipDb && !willUpdateExisting;

  // Creating a row needs a non-blank title (unless we're only uploading, --skip-db).
  if (mustCreate && !args.title?.trim() && interactive) {
    args.title = await prompt('Title (creating a new video): ');
  }
  if (mustCreate && !args.title?.trim() && !args.dryRun) {
    console.error(
      'Error: --title is required to create a new video row (or pass --video-id of an existing row, or --skip-db).',
    );
    process.exit(1);
  }

  // No point prompting for a playlist when DB writes (and thus linking) are off.
  if (
    args.playlistName === undefined &&
    !args.standalone &&
    !args.skipDb &&
    interactive
  ) {
    const name = await prompt('Playlist name (empty for standalone): ');
    args.playlistName = name || undefined;
  }

  const storagePath = `videos/${args.userId}/${videoId}`;

  // Existence is only known when we could check it (creds present). With an id
  // but no creds (e.g. cred-less dry-run) we can't say create vs finalize.
  const dbAction = args.skipDb
    ? 'skip (--skip-db)'
    : willUpdateExisting
      ? 'finalize existing'
      : args.videoId && !existenceKnown
        ? `create or finalize ${videoId} (existence not checked)`
        : `create "${args.title?.trim() ?? '(needs --title)'}"`;

  console.log('=== Video Convert (local → HLS) ===');
  console.log(`  File:        ${args.file}`);
  console.log(`  Video ID:    ${videoId}${args.videoId ? '' : ' (generated)'}`);
  console.log(`  DB action:   ${dbAction}`);
  console.log(`  User ID:     ${args.userId}`);
  console.log(`  GCP Bucket:  ${args.gcpBucket || '(not set)'}`);
  console.log(`  Storage:     ${storagePath}/`);
  console.log(`  Dry run:     ${args.dryRun}`);
  console.log(`  Concurrency: ${args.concurrency}`);
  console.log(
    `  Playlist:    ${args.playlistName ? `"${args.playlistName}" (slug: ${slugify(args.playlistName)})` : 'standalone (none)'}`,
  );
  console.log('');

  // Validation (skipped for dry-run, which writes nothing).
  if (!args.dryRun && !args.gcpBucket) {
    console.error(
      'Error: gcp-bucket not configured. Run: stream-m3u8.ts config set gcp-bucket <name>',
    );
    process.exit(1);
  }
  if (
    !args.skipDb &&
    !args.dryRun &&
    (!args.hasuraEndpoint || !args.hasuraSecret)
  ) {
    console.error('Error: hasura-endpoint and hasura-secret not configured.');
    process.exit(1);
  }

  const duration = await getDuration(args.file);
  console.log(`  Duration: ${duration}s (${(duration / 60).toFixed(1)} min)`);

  if (args.dryRun) {
    console.log('');
    console.log('[DRY RUN] Would:');
    console.log(`  1. ffmpeg-convert ${args.file} → fMP4 HLS`);
    console.log(
      `  2. upload playlist.m3u8 + init.mp4 + .m4s → ${storagePath}/`,
    );
    console.log(`  3. DB: ${dbAction}`);
    if (args.playlistName) {
      const where =
        args.position !== undefined
          ? `position ${args.position}`
          : 'the end (append)';
      console.log(
        `  4. find-or-create playlist "${args.playlistName}" and link at ${where}`,
      );
    }
    if (args.thumbnail) {
      console.log(
        `  *. re-host thumbnail ${args.thumbnail} → ${storagePath}/thumbnail.<ext> and set thumbnailUrl`,
      );
    } else if (args.thumbnailFromVideo) {
      const at =
        args.thumbnailAt !== undefined ? `${args.thumbnailAt}s` : '~1s';
      console.log(
        `  *. grab a frame from the source (at ${at}) → ${storagePath}/${VIDEO_THUMBNAIL_NAME} and set thumbnailUrl`,
      );
    }
    console.log('[DRY RUN] Done — nothing written.');
    return;
  }

  // 1. Convert locally.
  console.log('');
  console.log('Converting (ffmpeg)…');
  const { outputDir, cleanup } = await convertLocalToHls(args.file);

  try {
    // 1b. Optionally grab a frame from the source into the output dir, so it
    //     uploads with the HLS files below. Clamp the seek below the duration.
    let videoFrameThumbnailUrl: string | undefined;
    if (args.thumbnailFromVideo) {
      const at =
        args.thumbnailAt !== undefined
          ? Math.min(args.thumbnailAt, Math.max(duration - 1, 0))
          : Math.min(1, Math.max(duration - 1, 0));
      console.log(`Extracting thumbnail frame at ${at}s…`);
      await extractThumbnail(args.file, outputDir, at);
      videoFrameThumbnailUrl = getDownloadUrl(
        args.gcpBucket,
        `${storagePath}/${VIDEO_THUMBNAIL_NAME}`,
      );
    }

    // 2. Upload the HLS output (plus the extracted frame, if any).
    console.log('Uploading to GCS…');
    const storage = createStorage(args.gcpKeyPath);
    const bucket = storage.bucket(args.gcpBucket);
    const count = await uploadDir(
      bucket,
      outputDir,
      storagePath,
      args.concurrency,
    );
    const playlistUrl = getDownloadUrl(
      args.gcpBucket,
      `${storagePath}/${PLAYLIST_NAME}`,
    );
    console.log(`  Uploaded ${count} file(s).`);
    console.log(`  Playlist URL: ${playlistUrl}`);

    // 3. Create (if needed) + finalize the row.
    if (args.skipDb) {
      console.log('Skipping database update (--skip-db).');
    } else {
      if (!willUpdateExisting) {
        console.log(`Creating video row "${args.title}"…`);
        await createVideo(args, videoId);
      }
      // Optional thumbnail: either re-host a given image URL, or use the frame
      // already extracted from the source video (uploaded above). The two are
      // mutually exclusive (enforced at parse time).
      let thumbnailUrl: string | undefined;
      if (args.thumbnail) {
        console.log('Uploading thumbnail…');
        thumbnailUrl = await uploadThumbnailFromUrl(bucket, {
          imageUrl: args.thumbnail,
          referer: args.thumbnailReferer,
          storagePath,
        });
        console.log(`  Thumbnail: ${thumbnailUrl}`);
      } else if (videoFrameThumbnailUrl) {
        thumbnailUrl = videoFrameThumbnailUrl;
        console.log(`  Thumbnail (from video frame): ${thumbnailUrl}`);
      }
      console.log('Finalizing video row…');
      const sId = await finalizeVideo(
        args,
        videoId,
        playlistUrl,
        duration,
        thumbnailUrl,
      );
      console.log(`  status=ready  sId=${sId}`);

      // 4. Optional playlist link.
      if (args.playlistName) {
        console.log('Linking video to playlist…');
        await attachToPlaylist(args, videoId);
      }
    }

    console.log('');
    console.log('=== Done ===');
    console.log(`  Video ID: ${videoId}`);
    console.log(`  Playlist: ${playlistUrl}`);
    console.log(`  Duration: ${duration}s`);
  } finally {
    await cleanup();
  }
};

// ─── Main router ─────────────────────────────────────────────────────────────

const main = () => {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log('sworld-cli - Convert a local video file to HLS');
    console.log('');
    console.log(
      'Converts a local video with ffmpeg (fMP4 HLS), uploads to GCS,',
    );
    console.log('and creates/finalizes the videos row. Config is shared with');
    console.log('stream-m3u8.ts (~/.sworld-cli/config.json).');
    console.log('');
    console.log('Usage:');
    console.log(
      '  convert --file <path> --title <title> [options]      (create new video)',
    );
    console.log(
      '  convert --file <path> --video-id <uuid> [options]    (finalize existing)',
    );
    console.log('');
    console.log('Options:');
    console.log(
      '  --file <path>       Local video file (required; V1 is local-file only)',
    );
    console.log(
      '  --title <title>     Title — required when creating a new row',
    );
    console.log('  --slug <slug>       Slug (default: slugify(title))');
    console.log(
      '  --video-id <uuid>   Existing row to finalize; if missing, it is created',
    );
    console.log(
      '  --video-url <url>   Stored as videos.video_url on create (default: local:<filename>)',
    );
    console.log(
      '  --thumbnail <url>          Image URL to re-host to GCS + set as the thumbnail',
    );
    console.log(
      '  --thumbnail-referer <url> Referer for the thumbnail fetch (hotlink-protected hosts)',
    );
    console.log(
      '  --thumbnail-from-video    Grab a frame from the source as the thumbnail (no URL needed)',
    );
    console.log(
      '  --thumbnail-at <seconds>  Frame timestamp for --thumbnail-from-video (default ~1s)',
    );
    console.log(
      '  --public            Mark the new video public (default: private)',
    );
    console.log(
      '  --playlist <name>   Find-or-create this playlist (by slug) and link the video',
    );
    console.log(
      '  --position <n>      Position in the playlist (default: append to end)',
    );
    console.log('  --standalone        Skip the playlist prompt (no playlist)');
    console.log('  --concurrency <n>   Parallel segment uploads (default: 5)');
    console.log(
      '  --dry-run           Show the plan; no encode-upload/DB writes',
    );
    console.log(
      '  --skip-db           Convert + upload to GCS but skip all Hasura writes',
    );
    console.log(
      '  --user-id <uuid>    Owner (from --user-id > env > config user-id)',
    );
    console.log('');
    console.log('Configure once (shared with stream-m3u8.ts):');
    console.log(
      '  npx tsx src/cli/stream-m3u8.ts config set gcp-key /path/to/key.json',
    );
    return;
  }

  if (command === 'convert') {
    handleConvert(args.slice(1))
      // Exit explicitly on success — GCS/fetch keep-alive sockets can otherwise
      // keep the event loop alive, hanging any batch that waits on this process.
      // flushThenExit drains stdio first so captured output isn't truncated.
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
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error('Run with --help for usage info.');
  process.exit(1);
};

main();
