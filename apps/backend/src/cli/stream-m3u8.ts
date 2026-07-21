#!/usr/bin/env tsx

/**
 * CLI tool to process m3u8 streams: fetch -> parse -> filter ads -> upload to GCS -> update Hasura DB
 *
 * Setup (one-time):
 *   npx tsx src/cli/stream-m3u8.ts config set gcp-key /path/to/service-account.json
 *   npx tsx src/cli/stream-m3u8.ts config set user-id "your-user-uuid"
 *   npx tsx src/cli/stream-m3u8.ts config set gcp-bucket "my-world-dev.appspot.com"
 *   npx tsx src/cli/stream-m3u8.ts config set hasura-endpoint "http://localhost:8030/v1/graphql"
 *   npx tsx src/cli/stream-m3u8.ts config set hasura-secret "your-admin-secret"
 *
 * Usage:
 *   npx tsx src/cli/stream-m3u8.ts stream --url <m3u8-url> --video-id <uuid> [options]
 *
 * Commands:
 *   stream           Process an m3u8 URL
 *   config set       Set a config value
 *   config get       Get a config value
 *   config list      List all config values
 *   config path      Show config file path
 */

import {
  chmodSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { Storage } from '@google-cloud/storage';
import { slugify } from '@shinabr2/core/universal/common';
import { randomUUID } from 'crypto';
import { GraphQLClient } from 'graphql-request';
import { nanoid } from 'nanoid';
import os from 'os';
import path from 'path';
import { uploadThumbnailFromUrl } from 'src/services/videos/helpers/thumbnail-from-url';
import { processStream } from 'src/services/videos/processing/processStream';
import type { ProcessStreamDeps } from 'src/services/videos/processing/types';
import { flushThenExit } from './cli-exit';

// ─── Interactive prompt ─────────────────────────────────────────────────────────

async function prompt(question: string, defaultValue = ''): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(question)).trim();
    return answer || defaultValue;
  } finally {
    rl.close();
  }
}

// ─── Config System ──────────────────────────────────────────────────────────

const CONFIG_DIR = path.join(os.homedir(), '.sworld-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface CliConfig {
  'user-id'?: string;
  'gcp-key'?: string;
  'gcp-bucket'?: string;
  'hasura-endpoint'?: string;
  'hasura-secret'?: string;
  concurrency?: number;
}

const VALID_KEYS: (keyof CliConfig)[] = [
  'user-id',
  'gcp-key',
  'gcp-bucket',
  'hasura-endpoint',
  'hasura-secret',
  'concurrency',
];

function loadConfig(): CliConfig {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveConfig(config: CliConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n', {
    mode: 0o600,
  });
  // Config holds the Hasura admin secret — keep it readable only by the owner.
  chmodSync(CONFIG_FILE, 0o600);
}

function handleConfig(args: string[]): void {
  const subcommand = args[0];

  if (subcommand === 'set') {
    const key = args[1] as keyof CliConfig;
    const value = args[2];

    if (!key || !value) {
      console.error('Usage: config set <key> <value>');
      console.error('');
      console.error('Available keys:');
      for (const k of VALID_KEYS) {
        console.error(`  ${k}`);
      }
      process.exit(1);
    }

    if (!VALID_KEYS.includes(key)) {
      console.error(`Unknown config key: ${key}`);
      console.error(`Valid keys: ${VALID_KEYS.join(', ')}`);
      process.exit(1);
    }

    // Validate gcp-key path exists
    if (key === 'gcp-key' && !existsSync(value)) {
      console.error(`Error: File not found: ${value}`);
      process.exit(1);
    }

    const config = loadConfig();
    (config as any)[key] = key === 'concurrency' ? Number(value) : value;
    saveConfig(config);
    console.log(`Set ${key} = ${key === 'hasura-secret' ? '****' : value}`);
    return;
  }

  if (subcommand === 'get') {
    const key = args[1] as keyof CliConfig;
    if (!key) {
      console.error('Usage: config get <key>');
      process.exit(1);
    }
    const config = loadConfig();
    const value = config[key];
    if (value !== undefined) {
      console.log(key === 'hasura-secret' ? '****' : value);
    } else {
      console.error(`Not set: ${key}`);
      process.exit(1);
    }
    return;
  }

  if (subcommand === 'list') {
    const config = loadConfig();
    if (Object.keys(config).length === 0) {
      console.log(
        'No config set. Run `config set <key> <value>` to configure.',
      );
      return;
    }
    for (const [key, value] of Object.entries(config)) {
      const display = key === 'hasura-secret' ? '****' : value;
      console.log(`  ${key} = ${display}`);
    }
    return;
  }

  if (subcommand === 'path') {
    console.log(CONFIG_FILE);
    return;
  }

  console.error('Usage: config <set|get|list|path>');
  process.exit(1);
}

// ─── Resolve config value: CLI flag > env var > config file ─────────────────

function resolve(
  flagValue: string | undefined,
  envKey: string,
  configKey: keyof CliConfig,
  config: CliConfig,
): string | undefined {
  return flagValue || process.env[envKey] || (config[configKey] as string);
}

// ─── Stream Command Argument Parsing ────────────────────────────────────────

interface StreamArgs {
  url?: string;
  file?: string;
  videoId: string;
  userId: string;
  taskId: string;
  skipDb: boolean;
  dryRun: boolean;
  standalone: boolean;
  concurrency: number;
  referer?: string;
  // Optional thumbnail image URL (re-hosted to GCS); reuses --referer for the fetch.
  thumbnail?: string;
  // Playlist linking (optional)
  playlistName?: string;
  position?: number;
  // Resolved config
  gcpKeyPath?: string;
  gcpBucket: string;
  hasuraEndpoint: string;
  hasuraSecret: string;
}

function parseStreamArgs(rawArgs: string[]): StreamArgs {
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

  // url / video-id are optional here: if omitted they are gathered interactively
  // in handleStream. user-id comes from flag/env/config (required).
  const url = get('--url');
  const file = get('--file');
  const videoId = get('--video-id') || '';
  // Owner comes from --user-id > env > config. Never hardcoded in source.
  const userId = resolve(
    get('--user-id'),
    'DEFAULT_USER_ID',
    'user-id',
    config,
  );
  if (!userId) {
    console.error(
      'Error: user-id not configured. Run `config set user-id <uuid>`, or pass --user-id <uuid>.',
    );
    process.exit(1);
  }

  if (url && file) {
    console.error('Error: use --url OR --file, not both.');
    process.exit(1);
  }
  if (file && !existsSync(file)) {
    console.error(`Error: File not found: ${file}`);
    process.exit(1);
  }

  const positionFlag = get('--position');
  const position =
    positionFlag !== undefined ? Number(positionFlag) : undefined;
  if (position !== undefined && !Number.isInteger(position)) {
    console.error('Error: --position must be an integer.');
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
  const concurrency = Number(get('--concurrency') || config.concurrency || '5');
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    console.error('Error: --concurrency must be a positive integer.');
    process.exit(1);
  }

  return {
    url,
    file,
    videoId,
    userId,
    taskId: get('--task-id') || randomUUID(),
    skipDb: has('--skip-db'),
    dryRun: has('--dry-run'),
    standalone: has('--standalone'),
    concurrency,
    referer: get('--referer'),
    thumbnail: get('--thumbnail'),
    playlistName: get('--playlist'),
    position,
    gcpKeyPath,
    gcpBucket,
    hasuraEndpoint,
    hasuraSecret,
  };
}

// ─── Fetch Headers ──────────────────────────────────────────────────────────

function buildFetchHeaders(referer?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
  };
  if (referer) {
    headers['Referer'] = referer.endsWith('/') ? referer : `${referer}/`;
    headers['Origin'] = referer.replace(/\/$/, '');
  }
  return headers;
}

// ─── M3U8 Parsing ───────────────────────────────────────────────────────────

const EXCLUDE_PATTERNS = [/\/adjump\//, /\/ads\//, /\/commercial\//];

// ─── GCS Upload ─────────────────────────────────────────────────────────────

function createStorage(gcpKeyPath?: string) {
  if (gcpKeyPath) {
    return new Storage({ keyFilename: gcpKeyPath });
  }
  return new Storage();
}

function getDownloadUrl(bucket: string, storagePath: string): string {
  return `https://storage.googleapis.com/${bucket}/${storagePath}`;
}

/**
 * Local deps for the shared `processStream` core: GCS storage from the CLI's
 * configured key, an http port that fetches URLs and reads `file://` sources, a
 * no-op thumbnail (the CLI doesn't make thumbnails), and a console logger.
 */
function buildCliDeps(args: StreamArgs): ProcessStreamDeps {
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
    http: {
      fetch: async (url, init) => {
        if (url.startsWith('file://')) {
          const filePath = fileURLToPath(url);
          return {
            text: async () => readFileSync(filePath, 'utf-8'),
            body: Readable.toWeb(
              createReadStream(filePath),
            ) as ReadableStream<Uint8Array>,
            status: 200,
            statusText: 'OK',
          };
        }
        return fetch(url, { headers: init?.headers });
      },
    },
    // The CLI doesn't generate thumbnails.
    thumbnail: { generateFromSegment: async () => undefined },
    logger: {
      info: (_obj, msg) => msg && console.log(`  ${msg}`),
      warn: (_obj, msg) => console.warn(`  ${msg ?? ''}`),
      error: (obj, msg) => console.error(`  ${msg ?? ''}`, obj),
    },
  };
}

// ─── Hasura DB Update ───────────────────────────────────────────────────────

const FINALIZE_VIDEO_MUTATION = `
  mutation FinalizeVideo(
    $videoId: uuid!
    $videoUpdates: videos_set_input!
  ) {
    update_videos_by_pk(pk_columns: { id: $videoId }, _set: $videoUpdates) {
      id
    }
  }
`;

async function updateDatabase(params: {
  videoId: string;
  playlistUrl: string;
  duration: number;
  thumbnailUrl?: string;
  hasuraEndpoint: string;
  hasuraSecret: string;
}): Promise<void> {
  const {
    videoId,
    playlistUrl,
    duration,
    thumbnailUrl,
    hasuraEndpoint,
    hasuraSecret,
  } = params;

  const client = new GraphQLClient(hasuraEndpoint, {
    headers: { 'x-hasura-admin-secret': hasuraSecret },
  });

  const sId = nanoid(11);

  await client.request(FINALIZE_VIDEO_MUTATION, {
    videoId,
    videoUpdates: {
      source: playlistUrl,
      status: 'ready',
      duration,
      sId,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
    },
  });

  console.log(`  sId: ${sId}`);
}

// ─── Hasura: video guard + playlist linking ──────────────────────────────────

const ASSERT_VIDEO_QUERY = `
  query AssertVideo($videoId: uuid!) {
    videos_by_pk(id: $videoId) { id }
  }
`;

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
    insert_playlist_one(object: { title: $title, slug: $slug, user_id: $userId }) {
      id
    }
  }
`;

const GET_LINK_QUERY = `
  query GetLink($playlistId: uuid!, $videoId: uuid!) {
    playlist_videos_by_pk(playlist_id: $playlistId, video_id: $videoId) {
      playlist_id
    }
  }
`;

const MAX_POSITION_QUERY = `
  query MaxPosition($playlistId: uuid!) {
    playlist_videos(
      where: { playlist_id: { _eq: $playlistId } }
      order_by: { position: desc }
      limit: 1
    ) {
      position
    }
  }
`;

const LINK_VIDEO_MUTATION = `
  mutation LinkVideo($playlistId: uuid!, $videoId: uuid!, $position: Int!) {
    insert_playlist_videos_one(
      object: { playlist_id: $playlistId, video_id: $videoId, position: $position }
    ) {
      playlist_id
    }
  }
`;

function makeClient(args: StreamArgs): GraphQLClient {
  return new GraphQLClient(args.hasuraEndpoint, {
    headers: { 'x-hasura-admin-secret': args.hasuraSecret },
  });
}

/** This tool only finalizes an EXISTING video row — fail fast if it is missing. */
async function assertVideoExists(args: StreamArgs): Promise<void> {
  const client = makeClient(args);
  const data = await client.request<{ videos_by_pk: { id: string } | null }>(
    ASSERT_VIDEO_QUERY,
    { videoId: args.videoId },
  );
  if (!data.videos_by_pk) {
    throw new Error(
      `Video ${args.videoId} not found. This tool only UPDATES an existing video row; it never creates one.`,
    );
  }
}

/** Find-or-create the playlist by slug, then link the video (error if already linked). */
async function attachToPlaylist(args: StreamArgs): Promise<void> {
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
  }>(GET_LINK_QUERY, { playlistId, videoId: args.videoId });
  if (existing.playlist_videos_by_pk) {
    throw new Error(
      `Video ${args.videoId} is already in playlist "${name}" (slug: ${slug}).`,
    );
  }

  let position = args.position;
  if (position === undefined) {
    const max = await client.request<{
      playlist_videos: { position: number }[];
    }>(MAX_POSITION_QUERY, { playlistId });
    position = (max.playlist_videos[0]?.position ?? 0) + 1;
  }

  await client.request(LINK_VIDEO_MUTATION, {
    playlistId,
    videoId: args.videoId,
    position,
  });
  console.log(`  Linked at position ${position}.`);
}

// ─── Stream Command ─────────────────────────────────────────────────────────

async function handleStream(rawArgs: string[]) {
  const args = parseStreamArgs(rawArgs);

  // Gather any missing inputs interactively (when run from a terminal).
  const interactive = Boolean(process.stdin.isTTY);
  if (!args.url && !args.file) {
    if (interactive)
      args.url = await prompt('M3U8 URL (master or media playlist): ');
    if (!args.url) {
      console.error('Error: a --url or --file is required.');
      process.exit(1);
    }
  }
  if (!args.videoId) {
    if (interactive) args.videoId = await prompt('Video ID (uuid): ');
    if (!args.videoId) {
      console.error('Error: --video-id is required.');
      process.exit(1);
    }
  }
  if (args.referer === undefined && interactive) {
    const ref = await prompt(
      'Referer header (leave empty if the source needs none): ',
    );
    args.referer = ref || undefined;
  }
  if (args.playlistName === undefined && !args.standalone && interactive) {
    const name = await prompt(
      'Playlist name (leave empty for a standalone video): ',
    );
    args.playlistName = name || undefined;
  }
  if (args.playlistName && args.position === undefined && interactive) {
    const pos = await prompt(
      'Position in playlist (leave empty to append to the end): ',
    );
    args.position = pos ? Number(pos) : undefined;
  }

  console.log('=== M3U8 Stream Processor ===');
  console.log(`  Source:      ${args.file ? `file: ${args.file}` : args.url}`);
  console.log(`  Video ID:    ${args.videoId}`);
  console.log(`  User ID:     ${args.userId}`);
  console.log(`  GCP Bucket:  ${args.gcpBucket}`);
  console.log(
    `  GCP Key:     ${args.gcpKeyPath ? path.basename(args.gcpKeyPath) : 'ADC (default)'}`,
  );
  console.log(`  Dry run:     ${args.dryRun}`);
  console.log(`  Skip DB:     ${args.skipDb}`);
  console.log(`  Concurrency: ${args.concurrency}`);
  console.log(`  Referer:     ${args.referer || '(none)'}`);
  console.log(
    `  Playlist:    ${args.playlistName ? `"${args.playlistName}" (slug: ${slugify(args.playlistName)})` : 'standalone (none)'}`,
  );
  console.log('');

  // Validate
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

  // Fail fast: this tool only UPDATES an existing video row.
  if (!args.dryRun && !args.skipDb) {
    await assertVideoExists(args);
  }

  // Source + per-request headers (UA + Referer/Origin). Local files are passed
  // as file:// URLs so the core resolves segment URIs and our http port reads them.
  const customRequestHeaders = buildFetchHeaders(args.referer);
  const sourceUrl = args.file ? `file://${path.resolve(args.file)}` : args.url!;
  const storagePath = `videos/${args.userId}/${args.videoId}`;

  console.log('');
  console.log(
    args.dryRun
      ? 'Resolving + parsing via the shared core (dry run, no upload)...'
      : 'Processing stream via the shared core...',
  );

  const result = await processStream(
    { sourceUrl, storagePath },
    {
      excludePatterns: EXCLUDE_PATTERNS,
      concurrencyLimit: args.concurrency,
      customRequestHeaders,
      dryRun: args.dryRun,
    },
    buildCliDeps(args),
  );

  console.log(`  Included segments: ${result.segments.included.length}`);
  console.log(`  Excluded segments (ads): ${result.segments.excluded.length}`);
  console.log(
    `  Total duration: ${result.duration}s (${(result.duration / 60).toFixed(1)} min)`,
  );

  if (args.dryRun) {
    console.log('');
    console.log('[DRY RUN] Generated playlist content:');
    console.log('---');
    console.log(result.modifiedContent);
    console.log('---');
    console.log(
      `[DRY RUN] Would upload ${result.segments.included.length} segments to: ${storagePath}/`,
    );
    if (args.playlistName) {
      const where =
        args.position !== undefined
          ? `position ${args.position}`
          : 'the end (append)';
      console.log(
        `[DRY RUN] Would find-or-create playlist "${args.playlistName}" (slug: ${slugify(args.playlistName)}) and link this video at ${where}.`,
      );
    }
    if (args.thumbnail) {
      console.log(
        `[DRY RUN] Would re-host thumbnail ${args.thumbnail} → ${storagePath}/thumbnail.<ext> and set thumbnailUrl.`,
      );
    }
    console.log('[DRY RUN] Done.');
    return;
  }

  console.log(`  Playlist URL: ${result.playlistUrl}`);

  // Update database
  console.log('');
  if (args.skipDb) {
    console.log('Skipping database update (--skip-db)');
  } else {
    // Optional thumbnail: re-host the given image URL to GCS (reusing --referer
    // for hotlink-protected hosts) and set thumbnailUrl in the finalize update.
    let thumbnailUrl: string | undefined;
    if (args.thumbnail) {
      console.log('Uploading thumbnail...');
      const bucket = createStorage(args.gcpKeyPath).bucket(args.gcpBucket);
      thumbnailUrl = await uploadThumbnailFromUrl(bucket, {
        imageUrl: args.thumbnail,
        referer: args.referer,
        storagePath,
      });
      console.log(`  Thumbnail: ${thumbnailUrl}`);
    }

    console.log('Updating Hasura database...');
    await updateDatabase({
      videoId: args.videoId,
      playlistUrl: result.playlistUrl,
      duration: result.duration,
      thumbnailUrl,
      hasuraEndpoint: args.hasuraEndpoint,
      hasuraSecret: args.hasuraSecret,
    });
    console.log('  Database updated.');
  }

  // Link to playlist (optional)
  if (args.playlistName && !args.skipDb) {
    console.log('');
    console.log('Linking video to playlist...');
    await attachToPlaylist(args);
  }

  console.log('');
  console.log('=== Done ===');
  console.log(`  Playlist: ${result.playlistUrl}`);
  console.log(`  Segments: ${result.segments.included.length}`);
  console.log(`  Duration: ${result.duration}s`);
}

// ─── Main Router ────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log('sworld-cli - M3U8 Stream Processor');
    console.log('');
    console.log('Commands:');
    console.log('  stream         Process an m3u8 URL and upload to GCS');
    console.log('  config         Manage CLI configuration');
    console.log('');
    console.log('Setup:');
    console.log('  config set gcp-key /path/to/service-account.json');
    console.log('  config set gcp-bucket my-bucket.appspot.com');
    console.log('  config set user-id your-user-uuid');
    console.log('');
    console.log('Usage:');
    console.log(
      '  stream                                  (interactive: prompts for url, video-id, playlist)',
    );
    console.log('  stream --url <m3u8-url> --video-id <uuid> [options]');
    console.log('');
    console.log('Stream options:');
    console.log(
      '  --url <m3u8>        Master or media playlist URL (master auto-resolves to best variant)',
    );
    console.log('  --file <path>       Local .m3u8 file instead of --url');
    console.log(
      '  --video-id <uuid>   Existing video row to finalize (required; never created)',
    );
    console.log(
      '  --playlist <name>   Find-or-create this playlist (by slug) and link the video',
    );
    console.log(
      '  --position <n>      Position in the playlist (default: append to end)',
    );
    console.log('  --standalone        Skip the playlist prompt (no playlist)');
    console.log('  --referer <url>     Referer/Origin header for CDN auth');
    console.log(
      '  --thumbnail <url>   Image URL to re-host to GCS + set as the thumbnail (uses --referer)',
    );
    console.log('  --concurrency <n>   Parallel segment uploads (default: 5)');
    console.log(
      '  --dry-run           Parse and show what would happen, no uploads/DB writes',
    );
    console.log(
      '  --skip-db           Upload to GCS but skip all Hasura writes',
    );
    console.log(
      '  --user-id <uuid>    Owner (from --user-id > env > config user-id)',
    );
    return;
  }

  if (command === 'config') {
    handleConfig(args.slice(1));
    return;
  }

  if (command === 'stream') {
    handleStream(args.slice(1))
      // Exit explicitly on success — GCS/fetch keep-alive sockets (esp. after
      // transient retries) can otherwise keep the event loop alive for minutes,
      // hanging any batch that waits on this process. flushThenExit drains stdio
      // first so captured output isn't truncated.
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
}

main();
