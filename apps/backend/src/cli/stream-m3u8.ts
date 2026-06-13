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

import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { Storage } from '@google-cloud/storage';
import { GraphQLClient } from 'graphql-request';
import { Parser } from 'm3u8-parser';
import { nanoid } from 'nanoid';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Owner of every manually-fixed video / playlist / subtitle.
 * Per project rule this is ALWAYS the same account.
 */
const USER_ID = '6ff27fda-03e8-4dcd-949b-f1328f955065';

// ─── Slugify ──────────────────────────────────────────────────────────────────
// Replica of packages/core/src/universal/common/stringHelpers.ts `slugify`, kept
// byte-for-byte so find-or-create reuses the same playlist rows the web app makes.

const charMap: Record<string, string> = {
  à: 'a',
  á: 'a',
  ạ: 'a',
  ả: 'a',
  ã: 'a',
  â: 'a',
  ầ: 'a',
  ấ: 'a',
  ậ: 'a',
  ẩ: 'a',
  ẫ: 'a',
  ă: 'a',
  ằ: 'a',
  ắ: 'a',
  ặ: 'a',
  ẳ: 'a',
  ẵ: 'a',
  è: 'e',
  é: 'e',
  ẹ: 'e',
  ẻ: 'e',
  ẽ: 'e',
  ê: 'e',
  ề: 'e',
  ế: 'e',
  ệ: 'e',
  ể: 'e',
  ễ: 'e',
  ì: 'i',
  í: 'i',
  ị: 'i',
  ỉ: 'i',
  ĩ: 'i',
  ò: 'o',
  ó: 'o',
  ọ: 'o',
  ỏ: 'o',
  õ: 'o',
  ô: 'o',
  ồ: 'o',
  ố: 'o',
  ộ: 'o',
  ổ: 'o',
  ỗ: 'o',
  ơ: 'o',
  ờ: 'o',
  ớ: 'o',
  ợ: 'o',
  ở: 'o',
  ỡ: 'o',
  ù: 'u',
  ú: 'u',
  ụ: 'u',
  ủ: 'u',
  ũ: 'u',
  ư: 'u',
  ừ: 'u',
  ứ: 'u',
  ự: 'u',
  ử: 'u',
  ữ: 'u',
  ỳ: 'y',
  ý: 'y',
  ỵ: 'y',
  ỷ: 'y',
  ỹ: 'y',
  đ: 'd',
};

function slugify(str: string): string {
  str = str.replace(/^\s+|\s+$/g, '').toLowerCase();

  for (const [key, value] of Object.entries(charMap)) {
    str = str.replace(new RegExp(key, 'g'), value);
  }

  const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaeeeeiiiioooouuuunc------';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return str
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
    return idx !== -1 ? rawArgs[idx + 1] : undefined;
  };
  const has = (flag: string): boolean => rawArgs.includes(flag);

  const config = loadConfig();

  // url / video-id are optional here: if omitted they are gathered interactively
  // in handleStream. user-id is fixed by project rule (overridable via flag/config).
  const url = get('--url');
  const file = get('--file');
  const videoId = get('--video-id') || '';
  const userId =
    resolve(get('--user-id'), 'DEFAULT_USER_ID', 'user-id', config) || USER_ID;

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

interface HLSSegment {
  url: string;
  name: string;
  duration?: number;
}

interface ParsedResult {
  modifiedContent: string;
  segments: {
    included: HLSSegment[];
    excluded: HLSSegment[];
  };
  duration: number;
}

function isAds(segmentUrl: string, excludePatterns: RegExp[]): boolean {
  return excludePatterns.some((pattern) => pattern.test(segmentUrl));
}

async function resolveMasterPlaylist(
  m3u8Url: string,
  headers: Record<string, string> = {},
): Promise<string | null> {
  const response = await fetch(m3u8Url, { headers });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch m3u8: ${response.status} ${response.statusText}`,
    );
  }

  const content = await response.text();
  const parser = new Parser();
  parser.push(content);
  parser.end();

  const { playlists, segments } = parser.manifest;

  if (segments && segments.length > 0) {
    return null;
  }

  if (playlists && playlists.length > 0) {
    const best = playlists.reduce((prev, curr) => {
      const prevBw = prev.attributes?.BANDWIDTH || 0;
      const currBw = curr.attributes?.BANDWIDTH || 0;
      return currBw > prevBw ? curr : prev;
    });

    const resolvedUrl = new URL(best.uri, m3u8Url).toString();
    console.log(`  Master playlist detected. Variants: ${playlists.length}`);
    console.log(
      `  Selected best quality: ${best.attributes?.RESOLUTION?.width || '?'}x${best.attributes?.RESOLUTION?.height || '?'} (${best.attributes?.BANDWIDTH || '?'} bps)`,
    );
    console.log(`  Resolved URL: ${resolvedUrl}`);
    return resolvedUrl;
  }

  throw new Error('M3U8 playlist has no segments and no variant streams');
}

async function parseM3U8Content(
  source: { url: string } | { filePath: string },
  excludePatterns: RegExp[] = [],
  headers: Record<string, string> = {},
): Promise<ParsedResult> {
  let content: string;
  let baseUrl: string | undefined;

  if ('filePath' in source) {
    console.log(`  Reading local file: ${source.filePath}`);
    content = readFileSync(source.filePath, 'utf-8');
  } else {
    const resolvedUrl = await resolveMasterPlaylist(source.url, headers);
    baseUrl = resolvedUrl || source.url;

    console.log(`  Fetching media playlist from: ${baseUrl}`);
    const response = await fetch(baseUrl, { headers });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch m3u8: ${response.status} ${response.statusText}`,
      );
    }
    content = await response.text();
  }
  const parser = new Parser();
  parser.push(content);
  parser.end();

  const manifest = parser.manifest;
  const segments = {
    included: [] as HLSSegment[],
    excluded: [] as HLSSegment[],
  };

  let modifiedContent = '';
  let totalDuration = 0;

  // #EXTM3U is mandatory and must always be the first line; the version tag is optional.
  modifiedContent += '#EXTM3U\n';
  if (manifest.version) {
    modifiedContent += `#EXT-X-VERSION:${manifest.version}\n`;
  }

  if (manifest.playlistType) {
    modifiedContent += `#EXT-X-PLAYLIST-TYPE:${manifest.playlistType}\n`;
  }

  if (manifest.targetDuration) {
    modifiedContent += `#EXT-X-TARGETDURATION:${manifest.targetDuration}\n`;
  }

  let segmentIndex = 0;
  manifest.segments?.forEach((segment) => {
    // For local files with absolute URLs, segment.uri is already absolute
    // For remote playlists, resolve relative URIs against the base URL
    const segmentUrl = baseUrl
      ? new URL(segment.uri, baseUrl).toString()
      : segment.uri;

    if (isAds(segmentUrl, excludePatterns)) {
      segments.excluded.push({ url: segmentUrl, name: '' });
    } else {
      if (segment.duration) {
        modifiedContent += `#EXTINF:${segment.duration},\n`;
        totalDuration += segment.duration;
        const segmentName = `${segmentIndex++}.ts`;
        modifiedContent += `${segmentName}\n`;
        segments.included.push({
          url: segmentUrl,
          name: segmentName,
          duration: segment.duration,
        });
      }
    }
  });

  if (manifest.endList) {
    modifiedContent += '#EXT-X-ENDLIST\n';
  }

  return { modifiedContent, segments, duration: Math.round(totalDuration) };
}

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

async function uploadPlaylist(
  storage: Storage,
  bucket: string,
  content: string,
  storagePath: string,
): Promise<void> {
  const file = storage.bucket(bucket).file(storagePath);
  const stream = file.createWriteStream({
    contentType: 'application/vnd.apple.mpegurl',
    metadata: { cacheControl: 'public, max-age=31536000' },
  });

  // pipeline() awaits completion and tears down both streams on any error.
  await pipeline(Readable.from(content), stream);
}

async function uploadSegment(
  storage: Storage,
  bucket: string,
  segmentUrl: string,
  storagePath: string,
  headers: Record<string, string> = {},
): Promise<void> {
  const response = await fetch(segmentUrl, { headers });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch segment: ${response.status} ${response.statusText} - ${segmentUrl}`,
    );
  }
  if (!response.body) {
    throw new Error(`Empty response body for segment: ${segmentUrl}`);
  }

  const file = storage.bucket(bucket).file(storagePath);
  const writeStream = file.createWriteStream({
    contentType: 'video/MP2T',
    metadata: { cacheControl: 'public, max-age=31536000' },
  });

  // pipeline() forwards SOURCE errors (socket drop / body timeout) as a rejection
  // and tears down both streams, so withRetry can catch and retry the segment.
  // (A bare pipe() leaves source errors unhandled and crashes the process.)
  await pipeline(Readable.fromWeb(response.body as any), writeStream);
}

/** Retry a transient async op (socket drops, body timeouts) with linear backoff. */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  attempts = 4,
  delayMs = 1500,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = (err as Error)?.message?.split('\n')[0] ?? String(err);
      if (i < attempts) {
        console.log(`    retry ${i}/${attempts - 1} for ${label}: ${msg}`);
        await new Promise((r) => setTimeout(r, delayMs * i));
      }
    }
  }
  throw lastErr;
}

async function uploadSegments(
  storage: Storage,
  bucket: string,
  segments: HLSSegment[],
  baseStoragePath: string,
  concurrency: number,
  headers: Record<string, string> = {},
): Promise<void> {
  for (let i = 0; i < segments.length; i += concurrency) {
    const batch = segments.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (segment) => {
        const segmentStoragePath = path.join(baseStoragePath, segment.name);
        // One dropped connection must not kill the whole video — retry the segment.
        await withRetry(
          () =>
            uploadSegment(
              storage,
              bucket,
              segment.url,
              segmentStoragePath,
              headers,
            ),
          segment.name,
        );
        console.log(
          `    Uploaded segment ${segment.name} (${segment.duration?.toFixed(2)}s)`,
        );
      }),
    );
  }
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
  hasuraEndpoint: string;
  hasuraSecret: string;
}): Promise<void> {
  const { videoId, playlistUrl, duration, hasuraEndpoint, hasuraSecret } =
    params;

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

  // Build fetch headers
  const fetchHeaders = buildFetchHeaders(args.referer);

  // Step 1: Parse M3U8
  console.log('[1/4] Parsing M3U8 playlist...');
  const source = args.file ? { filePath: args.file } : { url: args.url! };
  const { modifiedContent, segments, duration } = await parseM3U8Content(
    source,
    EXCLUDE_PATTERNS,
    fetchHeaders,
  );

  console.log(`  Included segments: ${segments.included.length}`);
  console.log(`  Excluded segments (ads): ${segments.excluded.length}`);
  console.log(
    `  Total duration: ${duration}s (${(duration / 60).toFixed(1)} min)`,
  );

  if (segments.included.length === 0) {
    console.error('Error: No valid segments found in M3U8 playlist');
    process.exit(1);
  }

  if (args.dryRun) {
    console.log('');
    console.log('[DRY RUN] Generated playlist content:');
    console.log('---');
    console.log(modifiedContent);
    console.log('---');
    console.log(
      `[DRY RUN] Would upload ${segments.included.length} segments to: videos/${args.userId}/${args.videoId}/`,
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
    console.log('[DRY RUN] Done.');
    return;
  }

  // Initialize GCS with service account key if configured
  const storage = createStorage(args.gcpKeyPath);
  const storagePath = `videos/${args.userId}/${args.videoId}`;
  const playlistStoragePath = path.join(storagePath, 'playlist.m3u8');

  // Step 2: Upload playlist
  console.log('');
  console.log('[2/4] Uploading playlist to GCS...');
  await uploadPlaylist(
    storage,
    args.gcpBucket,
    modifiedContent,
    playlistStoragePath,
  );
  const playlistUrl = getDownloadUrl(args.gcpBucket, playlistStoragePath);
  console.log(`  Playlist URL: ${playlistUrl}`);

  // Step 3: Upload segments
  console.log('');
  console.log(`[3/4] Uploading ${segments.included.length} segments to GCS...`);
  await uploadSegments(
    storage,
    args.gcpBucket,
    segments.included,
    storagePath,
    args.concurrency,
    fetchHeaders,
  );
  console.log('  All segments uploaded.');

  // Step 4: Update database
  console.log('');
  if (args.skipDb) {
    console.log('[4/4] Skipping database update (--skip-db)');
  } else {
    console.log('[4/4] Updating Hasura database...');
    await updateDatabase({
      videoId: args.videoId,
      playlistUrl,
      duration,
      hasuraEndpoint: args.hasuraEndpoint,
      hasuraSecret: args.hasuraSecret,
    });
    console.log('  Database updated.');
  }

  // Step 5: Link to playlist (optional)
  if (args.playlistName && !args.skipDb) {
    console.log('');
    console.log('[5/5] Linking video to playlist...');
    await attachToPlaylist(args);
  }

  console.log('');
  console.log('=== Done ===');
  console.log(`  Playlist: ${playlistUrl}`);
  console.log(`  Segments: ${segments.included.length}`);
  console.log(`  Duration: ${duration}s`);
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
    console.log('  --concurrency <n>   Parallel segment uploads (default: 5)');
    console.log(
      '  --dry-run           Parse and show what would happen, no uploads/DB writes',
    );
    console.log(
      '  --skip-db           Upload to GCS but skip all Hasura writes',
    );
    console.log(`  --user-id <uuid>    Override owner (default: ${USER_ID})`);
    return;
  }

  if (command === 'config') {
    handleConfig(args.slice(1));
    return;
  }

  if (command === 'stream') {
    handleStream(args.slice(1)).catch((error) => {
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
