#!/usr/bin/env tsx

/**
 * CLI tool to REPAIR a noisy video by repackaging its already-stored `.ts`
 * into fMP4/CMAF (init.mp4 + .m4s). This is the on-demand fix for the hls.js
 * MPEG-TS AAC-demux noise bug (the "Gosick" case) — see
 * `src/docs/fmp4-default-output/`.
 *
 * The default streaming flow is UNTOUCHED. You run this by hand for one video
 * that turns out noisy after it has streamed in and gone `ready`.
 *
 * It reads the `.ts` we already own (its public GCS playlist URL), so it works
 * even after the original third-party source URL has expired.
 *
 * Setup reuses the same `~/.sworld-cli/config.json` as `stream-m3u8.ts`
 * (gcp-key, gcp-bucket, hasura-endpoint, hasura-secret).
 *
 * Usage:
 *   npx tsx src/cli/repair-fmp4.ts repair --video-id <uuid> [--dry-run] [--delete-ts]
 */

import {
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import { rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Storage } from '@google-cloud/storage';
import ffmpeg from 'fluent-ffmpeg';
import { GraphQLClient } from 'graphql-request';
import { repackageToFmp4 } from 'src/services/videos/processing/repackageToFmp4';
import type {
  Fmp4Artifacts,
  RepackageDeps,
  RepackagePort,
} from 'src/services/videos/processing/types';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// ─── Config (reads the shared CLI config; never writes it) ──────────────────

const CONFIG_FILE = path.join(os.homedir(), '.sworld-cli', 'config.json');
const PLAYLIST_NAME = 'playlist.m3u8';
// The fMP4 playlist gets its OWN name (not an overwrite of playlist.m3u8). The
// original `.ts` playlist was uploaded with a 1-year max-age, so overwriting it
// can't reach clients/edge caches that already hold it. Publishing at a fresh
// URL + repointing `videos.source` sidesteps caching entirely.
const FMP4_PLAYLIST_NAME = 'playlist-fmp4.m3u8';
const PLAYLIST_CONTENT_TYPE = 'application/vnd.apple.mpegurl';

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
  deleteTs: boolean;
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
    deleteTs: has('--delete-ts'),
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

// ─── ffmpeg fMP4 remux adapter (RepackagePort) ──────────────────────────────

/**
 * Real `RepackagePort`: remux an HLS source URL into fMP4/CMAF in a temp dir
 * with no video transcode. Audio is re-encoded to AAC — the proven-clean recipe
 * that regenerates a correct `AudioSpecificConfig` and sidesteps the malformed
 * source config that causes the hls.js noise. Returns lazily-opened file streams
 * so a whole video never sits in memory, plus a `cleanup()` for the temp dir.
 */
function buildFfmpegRepackage(): RepackagePort {
  return {
    repackageToFmp4: async (sourceUrl: string) => {
      const tempDir = mkdtempSync(path.join(os.tmpdir(), 'fmp4-repair-'));
      const outputDir = path.join(tempDir, 'out');
      mkdirSync(outputDir, { recursive: true });
      const playlistPath = path.join(outputDir, PLAYLIST_NAME);

      await new Promise<void>((res, rej) => {
        ffmpeg(sourceUrl)
          .outputOptions([
            '-c:v',
            'copy', // no video transcode
            '-c:a',
            'aac',
            '-b:a',
            '128k',
            '-ac',
            '2',
            '-ar',
            '44100',
            '-hls_time',
            '6',
            '-hls_playlist_type',
            'vod',
            '-hls_segment_type',
            'fmp4',
            '-hls_fmp4_init_filename',
            'init.mp4',
          ])
          .format('hls')
          .output(playlistPath)
          .on('end', () => res())
          .on('error', (err, _stdout, stderr) =>
            rej(
              new Error(
                `ffmpeg fMP4 remux failed: ${err.message}\n${stderr ?? ''}`,
              ),
            ),
          )
          .run();
      });

      const segmentNames = readdirSync(outputDir)
        .filter((name) => name.endsWith('.m4s'))
        .sort(
          (a, b) =>
            Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0),
        );

      const artifacts: Fmp4Artifacts = {
        init: {
          name: 'init.mp4',
          stream: createReadStream(path.join(outputDir, 'init.mp4')),
        },
        segments: segmentNames.map((name) => ({
          name,
          stream: createReadStream(path.join(outputDir, name)),
        })),
        playlistContent: readFileSync(playlistPath, 'utf-8'),
      };

      return {
        artifacts,
        cleanup: async () => {
          await rm(tempDir, { recursive: true, force: true });
        },
      };
    },
  };
}

// ─── CLI deps for the P1 engine ─────────────────────────────────────────────

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

  console.log('=== fMP4 Repair ===');
  console.log(`  Video ID:    ${args.videoId}`);
  console.log(`  GCP Bucket:  ${args.gcpBucket}`);
  console.log(`  Dry run:        ${args.dryRun}`);
  console.log(`  Delete old .ts: ${args.deleteTs}`);
  console.log('');

  const video = await getVideo(args);
  const storagePath = `videos/${video.user_id}/${args.videoId}`;
  console.log(`  Storage path: ${storagePath}`);

  const storage = createStorage(args.gcpKeyPath);
  const bucket = storage.bucket(args.gcpBucket);

  // Count the existing .ts so the operator sees the before-state.
  const [existing] = await bucket.getFiles({ prefix: `${storagePath}/` });
  const staleTs = existing.filter((f) => f.name.endsWith('.ts'));
  console.log(`  Existing .ts segments: ${staleTs.length}`);

  const fmp4PlaylistPath = `${storagePath}/${FMP4_PLAYLIST_NAME}`;
  const newSource = getDownloadUrl(args.gcpBucket, fmp4PlaylistPath);

  if (args.dryRun) {
    console.log('');
    console.log('[DRY RUN] Would:');
    console.log(`  1. ffmpeg-remux ${storagePath}/${PLAYLIST_NAME} → fMP4`);
    console.log('  2. upload init.mp4 + .m4s (new names, alongside the .ts)');
    console.log(
      `  3. write the fMP4 playlist to ${FMP4_PLAYLIST_NAME} (no-cache)`,
    );
    console.log(`  4. point videos.source → ${newSource}`);
    console.log(
      `  5. ${args.deleteTs ? `delete the ${staleTs.length} old .ts segment(s) + ${PLAYLIST_NAME}` : `KEEP the ${staleTs.length} old .ts (re-runnable; use --delete-ts to remove)`}`,
    );
    console.log('[DRY RUN] Done — nothing written.');
    return;
  }

  // 1-2. Repackage + upload the new fMP4 segments (additive, non-destructive).
  console.log('');
  console.log('Repackaging to fMP4 (ffmpeg) + uploading new segments…');
  const { initName, segmentNames, playlistContent } = await repackageToFmp4(
    { storagePath },
    buildRepairDeps(args),
  );
  console.log(
    `  Uploaded ${initName} + ${segmentNames.length} .m4s segment(s).`,
  );

  // 3. Verify the new init exists before we publish (never a broken window).
  const [initExists] = await bucket.file(`${storagePath}/${initName}`).exists();
  if (!initExists) {
    throw new Error(
      `Aborting: ${initName} not found in storage after upload — leaving the .ts video untouched.`,
    );
  }

  // 4. Write the fMP4 playlist to its OWN name (no-cache), then point source at
  //    it. A fresh URL has no cache history, so clients get the fMP4 at once —
  //    unlike overwriting playlist.m3u8, which the edge may serve stale for up to
  //    its original 1-year max-age. source is only flipped after the fMP4 files
  //    are all in place, so a failure earlier leaves the .ts video serving.
  console.log(`Writing ${FMP4_PLAYLIST_NAME} (no-cache)…`);
  await bucket.file(fmp4PlaylistPath).save(playlistContent, {
    contentType: PLAYLIST_CONTENT_TYPE,
    metadata: { cacheControl: 'no-cache' },
  });
  console.log('Pointing videos.source → fMP4 playlist…');
  await updateVideoSource(args, newSource);

  // 5. The old .ts is now superseded. Keep it by default (the repair stays
  //    re-runnable from the original); delete only when asked.
  if (args.deleteTs) {
    const stale = [
      ...staleTs,
      ...existing.filter((f) => f.name.endsWith(`/${PLAYLIST_NAME}`)),
    ];
    console.log(`Deleting ${stale.length} superseded .ts object(s)…`);
    await Promise.all(stale.map((f) => f.delete()));
  } else if (staleTs.length) {
    console.log(
      `Keeping ${staleTs.length} old .ts segment(s) (re-runnable; --delete-ts to remove).`,
    );
  }

  console.log('');
  console.log('=== Done ===');
  console.log(`  videos.source now → ${newSource}`);
  console.log('  Verify it plays clean on desktop Chrome, then you are set.');
}

// ─── Main router ────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log('sworld-cli - fMP4 Repair');
    console.log('');
    console.log('Repackage one already-stored noisy video from .ts to fMP4.');
    console.log('');
    console.log('Usage:');
    console.log('  repair --video-id <uuid> [--dry-run] [--delete-ts]');
    console.log('');
    console.log('Options:');
    console.log('  --video-id <uuid>   Video to repair (required)');
    console.log('  --dry-run           Show the plan, write nothing');
    console.log(
      '  --delete-ts         Delete the old .ts after repair (default: keep, re-runnable)',
    );
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
