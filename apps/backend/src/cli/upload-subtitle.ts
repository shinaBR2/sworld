#!/usr/bin/env tsx

/**
 * CLI tool to upload a local subtitle (.vtt) to GCS and link it to a video in Hasura.
 *
 * Shares config with stream-m3u8.ts (~/.sworld-cli/config.json):
 *   npx tsx src/cli/stream-m3u8.ts config set gcp-key /path/to/service-account.json
 *   npx tsx src/cli/stream-m3u8.ts config set gcp-bucket "sworld-prod.appspot.com"
 *   npx tsx src/cli/stream-m3u8.ts config set hasura-endpoint "https://.../v1/graphql"
 *   npx tsx src/cli/stream-m3u8.ts config set hasura-secret "your-admin-secret"
 *
 * Usage:
 *   npx tsx src/cli/upload-subtitle.ts                                  (interactive)
 *   npx tsx src/cli/upload-subtitle.ts --file ./ep03.vtt --video-id <uuid> [options]
 *
 * Options:
 *   --file <path>       Local .vtt file (required)
 *   --video-id <uuid>   Existing video to attach the subtitle to (required)
 *   --lang <code>       Subtitle language (default: vi)
 *   --name <name>       Storage file name without extension (default: the file's base name)
 *   --not-default       Mark the subtitle as NOT the default track (default: it IS default)
 *   --user-id <uuid>    Override owner (default: the fixed project account)
 */

import { existsSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import os from 'node:os';
import path from 'node:path';
import { Storage } from '@google-cloud/storage';
import { GraphQLClient } from 'graphql-request';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Owner of every manually-fixed video / playlist / subtitle (project rule). */
const USER_ID = '6ff27fda-03e8-4dcd-949b-f1328f955065';
const DEFAULT_LANG = 'vi';

// ─── Shared config (same file as stream-m3u8.ts) ────────────────────────────────

const CONFIG_FILE = path.join(os.homedir(), '.sworld-cli', 'config.json');

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
  return flagValue || process.env[envKey] || (config[configKey] as string);
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

// ─── GCS ────────────────────────────────────────────────────────────────────────

function createStorage(gcpKeyPath?: string): Storage {
  return gcpKeyPath ? new Storage({ keyFilename: gcpKeyPath }) : new Storage();
}

function getDownloadUrl(bucket: string, storagePath: string): string {
  return `https://storage.googleapis.com/${bucket}/${storagePath}`;
}

/** Upload a local .vtt file. */
async function uploadVttFromFile(
  storage: Storage,
  bucket: string,
  localPath: string,
  storagePath: string,
): Promise<void> {
  await storage.bucket(bucket).upload(localPath, {
    destination: storagePath,
    metadata: {
      contentType: 'text/vtt',
      cacheControl: 'public, max-age=31536000',
    },
  });
}

/** Download a remote .vtt (following redirects) and stream it to GCS. */
async function uploadVttFromUrl(
  storage: Storage,
  bucket: string,
  url: string,
  storagePath: string,
): Promise<void> {
  const response = await fetch(url); // fetch follows redirects by default
  if (!response.ok) {
    throw new Error(
      `Failed to fetch subtitle: ${response.status} ${response.statusText}`,
    );
  }
  if (!response.body) {
    throw new Error(`Empty response body for subtitle: ${url}`);
  }

  const file = storage.bucket(bucket).file(storagePath);
  const writeStream = file.createWriteStream({
    contentType: 'text/vtt',
    metadata: { cacheControl: 'public, max-age=31536000' },
  });

  // pipeline() forwards source errors as a rejection and tears down both streams.
  await pipeline(Readable.fromWeb(response.body as never), writeStream);
}

// ─── Hasura ──────────────────────────────────────────────────────────────────────

const ASSERT_VIDEO_QUERY = `
  query AssertVideo($videoId: uuid!) {
    videos_by_pk(id: $videoId) { id }
  }
`;

const FIND_SUBTITLE_QUERY = `
  query FindSubtitle($videoId: uuid!, $lang: String!) {
    subtitles(where: { video_id: { _eq: $videoId }, lang: { _eq: $lang } }, limit: 1) {
      id
    }
  }
`;

const UPDATE_SUBTITLE_MUTATION = `
  mutation UpdateSubtitle($id: uuid!, $url: String!, $urlInput: String, $isDefault: Boolean!) {
    update_subtitles_by_pk(pk_columns: { id: $id }, _set: { url: $url, urlInput: $urlInput, isDefault: $isDefault }) {
      id
    }
  }
`;

const INSERT_SUBTITLE_MUTATION = `
  mutation InsertSubtitle(
    $videoId: uuid!
    $userId: uuid!
    $lang: String!
    $url: String!
    $urlInput: String
    $isDefault: Boolean!
  ) {
    insert_subtitles_one(
      object: {
        video_id: $videoId
        userId: $userId
        lang: $lang
        url: $url
        urlInput: $urlInput
        isDefault: $isDefault
      }
    ) {
      id
    }
  }
`;

function makeClient(endpoint: string, secret: string): GraphQLClient {
  return new GraphQLClient(endpoint, {
    headers: { 'x-hasura-admin-secret': secret },
  });
}

// ─── Argument parsing ────────────────────────────────────────────────────────────

interface SubtitleArgs {
  file?: string;
  url?: string;
  videoId: string;
  lang: string;
  name: string;
  isDefault: boolean;
  userId: string;
  gcpKeyPath?: string;
  gcpBucket: string;
  hasuraEndpoint: string;
  hasuraSecret: string;
}

async function gatherArgs(rawArgs: string[]): Promise<SubtitleArgs> {
  const get = (flag: string): string | undefined => {
    const idx = rawArgs.indexOf(flag);
    return idx !== -1 ? rawArgs[idx + 1] : undefined;
  };
  const has = (flag: string): boolean => rawArgs.includes(flag);

  const config = loadConfig();
  const interactive = Boolean(process.stdin.isTTY);

  // Source: a local file (--file) OR a remote URL (--url). Exactly one.
  let file = get('--file');
  let url = get('--url');
  if (!file && !url && interactive) {
    const src = await prompt('Subtitle source — local .vtt path OR a URL: ');
    if (/^https?:\/\//i.test(src)) url = src;
    else file = src;
  }
  if (file && url) {
    console.error('Error: use --file OR --url, not both.');
    process.exit(1);
  }
  if (!file && !url) {
    console.error('Error: a --file or --url is required.');
    process.exit(1);
  }
  if (file && !existsSync(file)) {
    console.error(`Error: File not found: ${file}`);
    process.exit(1);
  }

  let videoId = get('--video-id');
  if (!videoId && interactive) videoId = await prompt('Video ID (uuid): ');
  if (!videoId) {
    console.error('Error: --video-id is required.');
    process.exit(1);
  }

  const lang = get('--lang') || DEFAULT_LANG;

  // Default storage name = the source's base name (e.g. .../s06e02.vtt -> "s06e02").
  const sourcePath = file ?? new URL(url as string).pathname;
  const defaultName = path.basename(sourcePath, path.extname(sourcePath));
  let name = get('--name');
  if (name === undefined && interactive) {
    name = await prompt(
      `Storage file name without extension (default: ${defaultName}): `,
      defaultName,
    );
  }
  name = name || defaultName;

  const userId =
    resolve(get('--user-id'), 'DEFAULT_USER_ID', 'user-id', config) || USER_ID;
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
    file,
    url,
    videoId,
    lang,
    name,
    isDefault: !has('--not-default'),
    userId,
    gcpKeyPath,
    gcpBucket,
    hasuraEndpoint,
    hasuraSecret,
  };
}

// ─── Main flow ────────────────────────────────────────────────────────────────────

async function run(rawArgs: string[]): Promise<void> {
  const args = await gatherArgs(rawArgs);

  if (!args.gcpBucket) {
    console.error(
      'Error: gcp-bucket not configured. Run: stream-m3u8.ts config set gcp-bucket <bucket>',
    );
    process.exit(1);
  }
  if (!args.hasuraEndpoint || !args.hasuraSecret) {
    console.error('Error: hasura-endpoint and hasura-secret not configured.');
    process.exit(1);
  }

  const storagePath = `videos/${args.userId}/${args.videoId}/${args.name}.vtt`;

  console.log('=== Subtitle Uploader ===');
  console.log(
    `  Source:      ${args.file ? `file: ${args.file}` : `url: ${args.url}`}`,
  );
  console.log(`  Video ID:    ${args.videoId}`);
  console.log(`  Lang:        ${args.lang}`);
  console.log(`  Default:     ${args.isDefault}`);
  console.log(`  GCP Bucket:  ${args.gcpBucket}`);
  console.log(
    `  GCP Key:     ${args.gcpKeyPath ? path.basename(args.gcpKeyPath) : 'ADC (default)'}`,
  );
  console.log(`  Destination: ${storagePath}`);
  console.log('');

  const client = makeClient(args.hasuraEndpoint, args.hasuraSecret);

  // Step 1: the video must already exist.
  console.log('[1/3] Checking video exists...');
  const videoData = await client.request<{
    videos_by_pk: { id: string } | null;
  }>(ASSERT_VIDEO_QUERY, { videoId: args.videoId });
  if (!videoData.videos_by_pk) {
    throw new Error(`Video ${args.videoId} not found.`);
  }

  // Step 2: upload the .vtt to GCS (from a local file or by downloading a URL).
  console.log('[2/3] Uploading subtitle to GCS...');
  const storage = createStorage(args.gcpKeyPath);
  if (args.file) {
    await uploadVttFromFile(storage, args.gcpBucket, args.file, storagePath);
  } else {
    await uploadVttFromUrl(
      storage,
      args.gcpBucket,
      args.url as string,
      storagePath,
    );
  }
  const url = getDownloadUrl(args.gcpBucket, storagePath);
  console.log(`  Subtitle URL: ${url}`);

  // Step 3: insert or update the subtitles row for this (video, lang).
  console.log('[3/3] Saving subtitle row in Hasura...');
  const existing = await client.request<{ subtitles: { id: string }[] }>(
    FIND_SUBTITLE_QUERY,
    { videoId: args.videoId, lang: args.lang },
  );

  if (existing.subtitles[0]) {
    await client.request(UPDATE_SUBTITLE_MUTATION, {
      id: existing.subtitles[0].id,
      url,
      urlInput: args.url ?? null,
      isDefault: args.isDefault,
    });
    console.log(
      `  Updated existing ${args.lang} subtitle (id: ${existing.subtitles[0].id}).`,
    );
  } else {
    const inserted = await client.request<{
      insert_subtitles_one: { id: string };
    }>(INSERT_SUBTITLE_MUTATION, {
      videoId: args.videoId,
      userId: args.userId,
      lang: args.lang,
      url,
      urlInput: args.url ?? null,
      isDefault: args.isDefault,
    });
    console.log(
      `  Inserted new ${args.lang} subtitle (id: ${inserted.insert_subtitles_one.id}).`,
    );
  }

  console.log('');
  console.log('=== Done ===');
  console.log(`  ${url}`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────────

function main(): void {
  const rawArgs = process.argv.slice(2);

  if (rawArgs[0] === '--help' || rawArgs[0] === '-h') {
    console.log('sworld-cli - Subtitle Uploader');
    console.log('');
    console.log(
      'Uploads a local .vtt to GCS and links it to a video in Hasura.',
    );
    console.log('');
    console.log('Usage:');
    console.log(
      '  upload-subtitle.ts                                       (interactive)',
    );
    console.log(
      '  upload-subtitle.ts --url <vtt-url> --video-id <uuid> [options]',
    );
    console.log(
      '  upload-subtitle.ts --file ./ep03.vtt --video-id <uuid> [options]',
    );
    console.log('');
    console.log('Options:');
    console.log(
      '  --url <vtt-url>     Remote .vtt URL (downloaded, follows redirects)',
    );
    console.log('  --file <path>       Local .vtt file (use this OR --url)');
    console.log('  --video-id <uuid>   Existing video to attach to');
    console.log(`  --lang <code>       Language (default: ${DEFAULT_LANG})`);
    console.log(
      "  --name <name>       Storage file name without extension (default: file's base name)",
    );
    console.log(
      '  --not-default       Do NOT mark as the default track (default: it is)',
    );
    console.log(`  --user-id <uuid>    Override owner (default: ${USER_ID})`);
    return;
  }

  run(rawArgs).catch((error) => {
    console.error('');
    console.error('=== Error ===');
    console.error(error.message || error);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
    process.exit(1);
  });
}

main();
