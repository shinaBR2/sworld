#!/usr/bin/env tsx

/**
 * CLI tool to REPROCESS a stored video into a clean, cache-safe fMP4/CMAF
 * rendition. Repairs both defect classes: the hls.js MPEG-TS AAC-demux noise
 * (a stored `.ts` — the "Gosick" case) and a broken fMP4 with an empty first
 * segment (the Infinix case) — see `src/docs/look-video-pipeline-fix/`.
 *
 * The default streaming flow is UNTOUCHED. You run this by hand for one video
 * that turns out broken after it has streamed in and gone `ready`.
 *
 * It reads the objects we already own from GCS (their public URLs) — a stored
 * `.ts` playlist, or the fMP4 parts to concatenate — so it works even after the
 * original third-party source URL has expired.
 *
 * Every output (init, segments, manifest) is written under a FRESH versioned
 * directory (`v<N>/`) and `videos.source` is repointed at the new manifest, so
 * the fix is visible immediately despite GCS's 1-year immutable cache (SWO-639).
 * The previous objects are left untouched (harmless orphans).
 *
 * Setup reuses the same `~/.sworld-cli/config.json` as `stream-m3u8.ts`
 * (gcp-key, gcp-bucket, hasura-endpoint, hasura-secret).
 *
 * Usage:
 *   npx tsx src/cli/repair-fmp4.ts repair --video-id <uuid> [--dry-run]
 */

import { existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Storage } from '@google-cloud/storage';
import { GraphQLClient } from 'graphql-request';
import { assertFfmpegVersion } from 'src/services/videos/helpers/ffmpeg';
import { buildFfmpegRepackage } from 'src/services/videos/processing/ffmpegRepackageAdapter';
import { planReprocess } from 'src/services/videos/processing/planReprocess';
import { repackageToFmp4 } from 'src/services/videos/processing/repackageToFmp4';
import type { RepackageDeps } from 'src/services/videos/processing/types';

// ffmpeg resolves from PATH — must be >= 7 (see SWO-633). On the host this is
// the developer's system ffmpeg; in the compute image it is apt-installed.

// ─── Config (reads the shared CLI config; never writes it) ──────────────────

const CONFIG_FILE = path.join(os.homedir(), '.sworld-cli', 'config.json');
const PLAYLIST_NAME = 'playlist.m3u8';

interface CliConfig {
  'user-id'?: string;
  'gcp-key'?: string;
  'gcp-bucket'?: string;
  'hasura-endpoint'?: string;
  'hasura-secret'?: string;
}

function loadConfig(): CliConfig {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function resolve(
  flagValue: string | undefined,
  envKey: string,
  configKey: keyof CliConfig,
  config: CliConfig,
): string | undefined {
  return flagValue || process.env[envKey] || config[configKey];
}

// ─── Argument parsing ───────────────────────────────────────────────────────

interface RepairArgs {
  videoId: string;
  dryRun: boolean;
  gcpKeyPath?: string;
  gcpBucket: string;
  hasuraEndpoint: string;
  hasuraSecret: string;
}

function parseRepairArgs(rawArgs: string[]): RepairArgs {
  const get = (flag: string): string | undefined => {
    const idx = rawArgs.indexOf(flag);
    return idx !== -1 ? rawArgs[idx + 1] : undefined;
  };
  const has = (flag: string): boolean => rawArgs.includes(flag);

  const config = loadConfig();

  const videoId = get('--video-id') || '';
  if (!videoId) {
    console.error('Error: --video-id <uuid> is required.');
    process.exit(1);
  }

  const gcpKeyPath = resolve(
    get('--gcp-key'),
    'GOOGLE_APPLICATION_CREDENTIALS',
    'gcp-key',
    config,
  );
  const gcpBucket =
    resolve(get('--gcp-bucket'), 'GCP_STORAGE_BUCKET', 'gcp-bucket', config) ||
    '';
  const hasuraEndpoint =
    resolve(
      get('--hasura-endpoint'),
      'HASURA_ENDPOINT',
      'hasura-endpoint',
      config,
    ) || '';
  const hasuraSecret =
    resolve(
      get('--hasura-secret'),
      'HASURA_ADMIN_SECRET',
      'hasura-secret',
      config,
    ) || '';

  return {
    videoId,
    dryRun: has('--dry-run'),
    gcpKeyPath,
    gcpBucket,
    hasuraEndpoint,
    hasuraSecret,
  };
}

// ─── GCS helpers ────────────────────────────────────────────────────────────

function createStorage(gcpKeyPath?: string): Storage {
  return gcpKeyPath ? new Storage({ keyFilename: gcpKeyPath }) : new Storage();
}

function getDownloadUrl(bucket: string, storagePath: string): string {
  return `https://storage.googleapis.com/${bucket}/${storagePath}`;
}

// ─── CLI deps for the reprocess engine ──────────────────────────────────────

function buildRepairDeps(args: RepairArgs): RepackageDeps {
  const storage = createStorage(args.gcpKeyPath);
  const bucket = storage.bucket(args.gcpBucket);

  return {
    storage: {
      uploadStream: ({ stream, storagePath, contentType }) =>
        pipeline(
          stream,
          bucket.file(storagePath).createWriteStream({
            contentType,
            metadata: { cacheControl: 'public, max-age=31536000' },
          }),
        ),
      getDownloadUrl: (storagePath) =>
        getDownloadUrl(args.gcpBucket, storagePath),
    },
    repackage: buildFfmpegRepackage(),
    logger: {
      info: (_obj, msg) => msg && console.log(`  ${msg}`),
      warn: (_obj, msg) => console.warn(`  ${msg ?? ''}`),
      error: (obj, msg) => console.error(`  ${msg ?? ''}`, obj),
    },
  };
}

// ─── Hasura: look up the video ──────────────────────────────────────────────

const GET_VIDEO_QUERY = `
  query GetVideo($videoId: uuid!) {
    videos_by_pk(id: $videoId) { id user_id source }
  }
`;

interface VideoRow {
  id: string;
  user_id: string;
  source: string | null;
}

async function getVideo(args: RepairArgs): Promise<VideoRow> {
  const client = new GraphQLClient(args.hasuraEndpoint, {
    headers: { 'x-hasura-admin-secret': args.hasuraSecret },
  });
  const data = await client.request<{ videos_by_pk: VideoRow | null }>(
    GET_VIDEO_QUERY,
    { videoId: args.videoId },
  );
  if (!data.videos_by_pk) {
    throw new Error(`Video ${args.videoId} not found.`);
  }
  return data.videos_by_pk;
}

const UPDATE_SOURCE_MUTATION = `
  mutation UpdateSource($videoId: uuid!, $source: String!) {
    update_videos_by_pk(
      pk_columns: { id: $videoId }
      _set: { source: $source }
    ) { id }
  }
`;

async function updateVideoSource(
  args: RepairArgs,
  source: string,
): Promise<void> {
  const client = new GraphQLClient(args.hasuraEndpoint, {
    headers: { 'x-hasura-admin-secret': args.hasuraSecret },
  });
  await client.request(UPDATE_SOURCE_MUTATION, {
    videoId: args.videoId,
    source,
  });
}

// ─── Repair command ─────────────────────────────────────────────────────────

async function handleRepair(rawArgs: string[]) {
  const args = parseRepairArgs(rawArgs);

  if (!args.gcpBucket) {
    console.error(
      'Error: gcp-bucket not configured (config set gcp-bucket …).',
    );
    process.exit(1);
  }
  if (!args.hasuraEndpoint || !args.hasuraSecret) {
    console.error('Error: hasura-endpoint and hasura-secret not configured.');
    process.exit(1);
  }

  console.log('=== fMP4 Reprocess ===');
  console.log(`  Video ID:   ${args.videoId}`);
  console.log(`  GCP Bucket: ${args.gcpBucket}`);
  console.log(`  Dry run:    ${args.dryRun}`);
  console.log('');

  const video = await getVideo(args);
  const storagePath = `videos/${video.user_id}/${args.videoId}`;
  console.log(`  Storage path: ${storagePath}`);

  const storage = createStorage(args.gcpKeyPath);
  const bucket = storage.bucket(args.gcpBucket);

  // Plan a cache-safe reprocess from what's stored: the source to remux and a
  // fresh v<N>/ dir for ALL outputs (never overwrites a 1-year-cached object).
  const [existing] = await bucket.getFiles({ prefix: `${storagePath}/` });
  const { source, outputStoragePath } = planReprocess(
    existing.map((f) => ({
      name: f.name,
      size: Number(f.metadata?.size ?? 0),
    })),
    storagePath,
    (p) => getDownloadUrl(args.gcpBucket, p),
  );
  // Preview URL for the dry-run only; the real repoint URL is derived from the
  // engine's returned manifestStoragePath after the upload (below).
  const plannedSource = getDownloadUrl(
    args.gcpBucket,
    `${outputStoragePath}/${PLAYLIST_NAME}`,
  );

  const partCount = source.kind === 'fmp4-parts' ? source.partUrls.length : 0;
  console.log(
    `  Input mode:   ${source.kind === 'hls-url' ? 'remux stored .ts' : `recover fMP4 (${partCount} parts)`}`,
  );
  console.log(`  Output dir:   ${outputStoragePath}/`);

  if (args.dryRun) {
    console.log('');
    console.log('[DRY RUN] Would:');
    console.log(
      `  1. ${source.kind === 'hls-url' ? `remux ${storagePath}/${PLAYLIST_NAME}` : `concat + remux ${partCount} stored fMP4 part(s)`} → fMP4`,
    );
    console.log(
      `  2. upload init.mp4 + .m4s + ${PLAYLIST_NAME} under ${outputStoragePath}/`,
    );
    console.log(`  3. point videos.source → ${plannedSource}`);
    console.log('  4. leave the previous objects untouched (harmless orphans)');
    console.log('[DRY RUN] Done — nothing written.');
    return;
  }

  // Enforce the ffmpeg >= 7 prerequisite (SWO-633) before any real work: the
  // remux below drives the same fMP4/CMAF HLS muxer whose 4.x version emits the
  // empty first segment, so an old host ffmpeg would reprocess the video into the
  // very bug we're fixing. Fail fast instead — compute enforces this at startup.
  assertFfmpegVersion();

  console.log('');
  console.log('Reprocessing to fMP4 (ffmpeg) + uploading versioned rendition…');
  const { initName, segmentNames, manifestStoragePath } = await repackageToFmp4(
    { source, outputStoragePath },
    buildRepairDeps(args),
  );
  console.log(
    `  Uploaded ${initName} + ${segmentNames.length} .m4s segment(s) + manifest.`,
  );

  // Verify the new manifest is in place before repointing (never a broken
  // window). The engine uploads it LAST, so its presence implies the whole
  // versioned rendition is up.
  const [manifestExists] = await bucket.file(manifestStoragePath).exists();
  if (!manifestExists) {
    throw new Error(
      `Aborting: ${manifestStoragePath} not found after upload — leaving videos.source untouched.`,
    );
  }

  // Repoint at the manifest the engine actually wrote (not a pre-guessed path),
  // so the URL we verified above is exactly the one we point videos.source at.
  const newSource = getDownloadUrl(args.gcpBucket, manifestStoragePath);
  console.log('Pointing videos.source → versioned fMP4 manifest…');
  await updateVideoSource(args, newSource);

  console.log('');
  console.log('=== Done ===');
  console.log(`  videos.source now → ${newSource}`);
  console.log(
    '  Previous objects left untouched (orphans). Verify it plays clean.',
  );
}

// ─── Main router ────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log('sworld-cli - fMP4 Reprocess');
    console.log('');
    console.log(
      'Reprocess one stored video into a fresh, cache-safe fMP4 rendition',
    );
    console.log('(from a stored .ts, or by recovering a broken fMP4).');
    console.log('');
    console.log('Usage:');
    console.log('  repair --video-id <uuid> [--dry-run]');
    console.log('');
    console.log('Options:');
    console.log('  --video-id <uuid>   Video to reprocess (required)');
    console.log('  --dry-run           Show the plan, write nothing');
    console.log('  --gcp-key <path>    Override GCS key file');
    console.log('  --gcp-bucket <name> Override GCS bucket');
    return;
  }

  if (command === 'repair') {
    handleRepair(args.slice(1)).catch((error) => {
      console.error('');
      console.error('=== Error ===');
      console.error(error.message || error);
      if (error.response) {
        console.error('Response:', JSON.stringify(error.response, null, 2));
      }
      process.exit(1);
    });
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error('Run with --help for usage info.');
  process.exit(1);
}

main();
