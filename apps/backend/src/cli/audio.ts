#!/usr/bin/env tsx

/**
 * CLI tool to PUBLISH a local audio file to the listen library:
 *   read local .mp3 -> upload to GCS -> insert the `audios` row.
 *
 * This is the audio counterpart to the video CLIs (`convert.ts`,
 * `stream-m3u8.ts`). It is far simpler because audio needs no transcode: an mp3
 * is uploaded verbatim to `audios/<userId>/<slug>.mp3`, then `insert_audios_one`
 * writes the row (name, artistName, source, user_id, public). No ffmpeg, no HLS.
 *
 * Setup reuses the same `~/.sworld-cli/config.json` as the video CLIs
 * (gcp-key, gcp-bucket, hasura-endpoint, hasura-secret, user-id). Configure it
 * once via `stream-m3u8.ts config set <key> <value>`.
 *
 * Usage:
 *   npx tsx src/cli/audio.ts --file './Song - Artist.mp3' [options]
 *   npx tsx src/cli/audio.ts --dir ./tracks [--artist 'Artist'] [options]
 *   npx tsx src/cli/audio.ts --file ./song.mp3 --name 'Song' --artist 'Artist'
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { type Bucket, Storage } from '@google-cloud/storage';
import { slugify } from '@shinabr2/core/universal/common';
import { GraphQLClient } from 'graphql-request';
import { flushThenExit } from './cli-exit';

// ─── Constants ──────────────────────────────────────────────────────────────

const CACHE_CONTROL = 'public, max-age=31536000';
const AUDIO_CONTENT_TYPE = 'audio/mpeg';
/** V1 handles mp3 only — the listen library is mp3-based. */
const AUDIO_EXTENSION = '.mp3';

// ─── Config (reads the shared CLI config; configure via stream-m3u8.ts) ───────

const CONFIG_FILE = path.join(os.homedir(), '.sworld-cli', 'config.json');

interface CliConfig {
  'user-id'?: string;
  'gcp-key'?: string;
  'gcp-bucket'?: string;
  'hasura-endpoint'?: string;
  'hasura-secret'?: string;
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

interface AudioArgs {
  file?: string;
  dir?: string;
  name?: string;
  artist?: string;
  isPublic: boolean;
  userId: string;
  skipDb: boolean;
  dryRun: boolean;
  gcpKeyPath?: string;
  gcpBucket: string;
  hasuraEndpoint: string;
  hasuraSecret: string;
}

const parseAudioArgs = (rawArgs: string[]): AudioArgs => {
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
      'Error: --url is not supported in V1. Publish a local file with --file <path> or --dir <path>.',
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
  // --name renames a single track — it can't be shared across a whole folder.
  if (dir && get('--name')) {
    console.error(
      'Error: --name applies to a single --file; it cannot be used with --dir.',
    );
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

  return {
    file,
    dir,
    // Normalize at the source: a blank/whitespace value is treated as unset, so
    // every downstream check + the insert see a real value or nothing.
    name: get('--name')?.trim() || undefined,
    artist: get('--artist')?.trim() || undefined,
    isPublic: has('--public'),
    userId,
    skipDb: has('--skip-db'),
    dryRun: has('--dry-run'),
    gcpKeyPath,
    gcpBucket,
    hasuraEndpoint,
    hasuraSecret,
  };
};

// ─── Filename → metadata ─────────────────────────────────────────────────────

interface TrackMeta {
  name: string;
  artist: string;
}

/**
 * Derive `name` + `artist` from a `Title - Artist.mp3` basename, with optional
 * overrides. `artist_name` is NOT NULL, so a file with no parseable artist and
 * no `--artist` throws — better than inserting a bad row. The split is on the
 * FIRST ` - ` so a title that itself contains a dash keeps the rest as artist.
 */
const deriveMeta = (
  filePath: string,
  nameOverride?: string,
  artistOverride?: string,
): TrackMeta => {
  const base = path.basename(filePath, path.extname(filePath)).trim();
  const sep = base.indexOf(' - ');
  const parsedName = sep === -1 ? base : base.slice(0, sep).trim();
  const parsedArtist = sep === -1 ? undefined : base.slice(sep + 3).trim();

  const name = nameOverride || parsedName;
  const artist = artistOverride || parsedArtist;
  if (!name) {
    throw new Error(`Could not determine a name for "${filePath}".`);
  }
  if (!artist) {
    throw new Error(
      `Could not determine an artist for "${filePath}". Name the file "Title - Artist.mp3" or pass --artist.`,
    );
  }
  return { name, artist };
};

/** Collect the mp3 files to publish, from a single --file or every mp3 in --dir. */
const collectFiles = (args: AudioArgs): string[] => {
  if (args.file) return [args.file];
  const dir = args.dir;
  if (!dir) return [];
  const files = readdirSync(dir)
    .filter(
      (name) =>
        path.extname(name).toLowerCase() === AUDIO_EXTENSION &&
        statSync(path.join(dir, name)).isFile(),
    )
    .map((name) => path.join(dir, name))
    .sort();
  if (files.length === 0) {
    throw new Error(`No ${AUDIO_EXTENSION} files found in ${dir}`);
  }
  return files;
};

// ─── GCS helpers ─────────────────────────────────────────────────────────────

const createStorage = (gcpKeyPath?: string): Storage =>
  gcpKeyPath ? new Storage({ keyFilename: gcpKeyPath }) : new Storage();

const getDownloadUrl = (bucket: string, storagePath: string): string =>
  `https://storage.googleapis.com/${bucket}/${storagePath}`;

/** Upload one local mp3 to `storagePath`, returning the public URL. */
const uploadAudio = async (
  bucket: Bucket,
  localFile: string,
  storagePath: string,
): Promise<void> => {
  await bucket.upload(localFile, {
    destination: storagePath,
    resumable: false,
    metadata: {
      cacheControl: CACHE_CONTROL,
      contentType: AUDIO_CONTENT_TYPE,
    },
  });
};

// ─── Hasura ──────────────────────────────────────────────────────────────────

const makeClient = (args: AudioArgs): GraphQLClient =>
  new GraphQLClient(args.hasuraEndpoint, {
    headers: { 'x-hasura-admin-secret': args.hasuraSecret },
  });

const FIND_AUDIO_QUERY = `
  query FindAudio($userId: uuid!, $name: String!) {
    audios(where: { user_id: { _eq: $userId }, name: { _eq: $name } }, limit: 1) {
      id
    }
  }
`;

const CREATE_AUDIO_MUTATION = `
  mutation CreateAudio($object: audios_insert_input!) {
    insert_audios_one(object: $object) { id }
  }
`;

/** True if this owner already has an audio with this name. */
const audioExists = async (args: AudioArgs, name: string): Promise<boolean> => {
  const data = await makeClient(args).request<{ audios: { id: string }[] }>(
    FIND_AUDIO_QUERY,
    { userId: args.userId, name },
  );
  return data.audios.length > 0;
};

/** Insert one audios row. */
const createAudio = async (
  args: AudioArgs,
  meta: TrackMeta,
  source: string,
): Promise<string> => {
  const data = await makeClient(args).request<{
    insert_audios_one: { id: string };
  }>(CREATE_AUDIO_MUTATION, {
    object: {
      name: meta.name,
      artistName: meta.artist,
      source,
      user_id: args.userId,
      public: args.isPublic,
    },
  });
  return data.insert_audios_one.id;
};

// ─── Per-file publish ────────────────────────────────────────────────────────

type PublishOutcome = 'created' | 'skipped' | 'dry-run' | 'failed';

/** Publish one mp3: derive metadata, dup-check, upload, insert. */
const publishOne = async (
  args: AudioArgs,
  bucket: Bucket | undefined,
  localFile: string,
): Promise<PublishOutcome> => {
  let meta: TrackMeta;
  try {
    meta = deriveMeta(localFile, args.name, args.artist);
  } catch (error) {
    console.error(
      `  ✗ ${path.basename(localFile)}: ${(error as Error).message}`,
    );
    return 'failed';
  }

  const slug = slugify(meta.name);
  const storagePath = `audios/${args.userId}/${slug}${AUDIO_EXTENSION}`;
  const source = getDownloadUrl(args.gcpBucket, storagePath);

  if (args.dryRun) {
    console.log(`  • ${meta.name} — ${meta.artist}`);
    console.log(`      would upload → ${storagePath}`);
    console.log(
      `      would insert audios row (public: ${args.isPublic}, source: ${source})`,
    );
    return 'dry-run';
  }

  // Skip rather than create a duplicate for the same owner + name.
  if (!args.skipDb && (await audioExists(args, meta.name))) {
    console.warn(`  ⚠ ${meta.name} — already exists, skipping.`);
    return 'skipped';
  }

  // bucket is only undefined on a dry run, which returned above.
  if (!bucket) throw new Error('Storage bucket not initialised.');
  await uploadAudio(bucket, localFile, storagePath);
  console.log(`  ↑ ${storagePath}`);

  if (args.skipDb) {
    console.log(`  ✓ ${meta.name} — ${meta.artist} (uploaded, DB skipped)`);
    return 'created';
  }

  const id = await createAudio(args, meta, source);
  console.log(`  ✓ ${meta.name} — ${meta.artist} (${id})`);
  return 'created';
};

// ─── Audio command ───────────────────────────────────────────────────────────

const handleAudio = async (rawArgs: string[]): Promise<void> => {
  const args = parseAudioArgs(rawArgs);
  const files = collectFiles(args);

  console.log('=== Audio Publisher ===');
  console.log(
    `  Source:     ${args.file ? args.file : `${args.dir} (${files.length} files)`}`,
  );
  console.log(`  User ID:    ${args.userId}`);
  console.log(`  GCP Bucket: ${args.gcpBucket}`);
  console.log(
    `  GCP Key:    ${args.gcpKeyPath ? path.basename(args.gcpKeyPath) : 'ADC (default)'}`,
  );
  console.log(`  Public:     ${args.isPublic}`);
  console.log(`  Dry run:    ${args.dryRun}`);
  console.log(`  Skip DB:    ${args.skipDb}`);
  console.log('');

  // Validate config the same way the video CLIs do.
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

  const tally: Record<PublishOutcome, number> = {
    created: 0,
    skipped: 0,
    'dry-run': 0,
    failed: 0,
  };
  for (const localFile of files) {
    // One bad file in a batch shouldn't abort the rest — record it and move on.
    try {
      tally[await publishOne(args, bucket, localFile)] += 1;
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
    console.log(
      'sworld-cli - Publish a local audio file to the listen library',
    );
    console.log('');
    console.log('Config is shared with the video CLIs and set via');
    console.log('stream-m3u8.ts (~/.sworld-cli/config.json).');
    console.log('');
    console.log('Usage:');
    console.log("  audio.ts --file './Song - Artist.mp3' [options]");
    console.log('  audio.ts --dir ./tracks [--artist <name>] [options]');
    console.log('');
    console.log('Options:');
    console.log('  --file <path>       Local .mp3 to publish');
    console.log('  --dir <path>        Publish every .mp3 in a folder');
    console.log(
      '  --name <name>       Track name (default: from "Title - Artist.mp3"; --file only)',
    );
    console.log(
      '  --artist <name>     Artist (default: from "Title - Artist.mp3")',
    );
    console.log(
      '  --public            Mark the audio public (default: private)',
    );
    console.log(
      '  --dry-run           Show what would happen, no uploads/DB writes',
    );
    console.log(
      '  --skip-db           Upload to GCS but skip the Hasura insert',
    );
    console.log(
      '  --user-id <uuid>    Owner (from --user-id > env > config user-id)',
    );
    return;
  }

  handleAudio(args)
    // Exit explicitly on success — GCS keep-alive sockets can otherwise keep the
    // event loop alive for minutes, hanging any batch that waits on this
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
