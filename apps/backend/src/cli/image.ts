#!/usr/bin/env tsx

/**
 * CLI tool to INGEST a local image file into the Look library:
 *   read local image -> derive date-taken -> generate renditions + blur-hash ->
 *   upload original + medium + thumb to GCS -> insert the `photos` row.
 *
 * This is the image counterpart to `audio.ts` (publish a local file, no server
 * pipeline). Where audio uploads one file verbatim, an image fans out into three
 * stored renditions plus a tiny blur-hash placeholder:
 *
 *   1. EXIF `DateTimeOriginal` -> `taken_at` (falls back to the file's mtime when
 *      the image carries no EXIF — downloaded stills usually don't).
 *   2. `sharp` reads width/height and resizes a thumbnail (~300px longest edge)
 *      and a medium (~1200px longest edge), preserving aspect ratio. The original
 *      is uploaded as-is.
 *   3. `blurhash` encodes a compact blurred placeholder from a downscaled version.
 *   4. All three renditions go to `photos/<userId>/<photoId>/{original,medium,thumb}.<ext>`.
 *   5. `insert_photos_one` writes the row; `--album` additionally find-or-creates
 *      a `playlist` (site='look') and links each photo in filename order.
 *
 * Setup reuses the same `~/.sworld-cli/config.json` as the video/audio CLIs
 * (gcp-key, gcp-bucket, hasura-endpoint, hasura-secret, user-id). Configure it
 * once via `stream-m3u8.ts config set <key> <value>`.
 *
 * Usage:
 *   npx tsx src/cli/image.ts --file ./photo.jpg [options]
 *   npx tsx src/cli/image.ts --dir ./album --album 'My Album' [options]
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { type Bucket, Storage } from '@google-cloud/storage';
import { encode } from 'blurhash';
import { slugify } from 'core/universal/common';
import exifr from 'exifr';
import { GraphQLClient } from 'graphql-request';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { flushThenExit } from './cli-exit';

// ─── Constants ──────────────────────────────────────────────────────────────

const CACHE_CONTROL = 'public, max-age=31536000';
/** The image formats sharp can read + re-encode reliably for the Look library. */
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
/** Longest-edge caps for the two derived renditions (px). */
const THUMB_MAX_EDGE = 300;
const MEDIUM_MAX_EDGE = 1200;
/** Blur-hash: downscale to this longest edge, then encode with 4x4 components. */
const BLURHASH_MAX_EDGE = 32;
const BLURHASH_COMPONENTS_X = 4;
const BLURHASH_COMPONENTS_Y = 4;

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

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

interface ImageArgs {
  file?: string;
  dir?: string;
  album?: string;
  isPublic: boolean;
  userId: string;
  skipDb: boolean;
  dryRun: boolean;
  gcpKeyPath?: string;
  gcpBucket: string;
  hasuraEndpoint: string;
  hasuraSecret: string;
}

const parseImageArgs = (rawArgs: string[]): ImageArgs => {
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
    // Normalize at the source: a blank/whitespace value is treated as unset.
    album: get('--album')?.trim() || undefined,
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

interface ImageMeta {
  /** Normalized extension WITH the leading dot, lowercased (e.g. `.jpg`). */
  ext: string;
  /** Storage-safe slug derived from the basename. Also the dup-check key. */
  slug: string;
}

/** Derive the extension + slug from a file path. Slug is `slugify(basename)`. */
const deriveMeta = (filePath: string): ImageMeta => {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath, path.extname(filePath)).trim();
  const slug = slugify(base);
  if (!slug) {
    throw new Error(`Could not derive a slug from "${filePath}".`);
  }
  return { ext, slug };
};

/** Collect the image files to ingest, from a single --file or every image in --dir. */
const collectFiles = (args: ImageArgs): string[] => {
  if (args.file) return [args.file];
  const dir = args.dir;
  if (!dir) return [];
  const files = readdirSync(dir)
    .filter(
      (name) =>
        IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()) &&
        statSync(path.join(dir, name)).isFile(),
    )
    .map((name) => path.join(dir, name))
    // Filename order (natural/numeric): this is the album ordering too (position
    // follows it), so `img2` sorts before `img10`, not after.
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length === 0) {
    throw new Error(
      `No image files (${[...IMAGE_EXTENSIONS].join(', ')}) found in ${dir}`,
    );
  }
  return files;
};

// ─── Date taken ──────────────────────────────────────────────────────────────

/**
 * Resolve `taken_at`: EXIF `DateTimeOriginal` if present, else the file's mtime.
 * Downloaded stills usually carry no EXIF, so the mtime fallback is the norm.
 */
const resolveTakenAt = async (filePath: string): Promise<string> => {
  try {
    const exif = await exifr.parse(filePath, { pick: ['DateTimeOriginal'] });
    const original = exif?.DateTimeOriginal;
    if (original instanceof Date && !Number.isNaN(original.getTime())) {
      return original.toISOString();
    }
  } catch {
    // A malformed/absent EXIF block is expected — fall through to mtime.
  }
  return statSync(filePath).mtime.toISOString();
};

// ─── Image processing (sharp + blurhash) ─────────────────────────────────────

interface Renditions {
  width: number;
  height: number;
  blurHash: string;
  medium: Buffer;
  thumb: Buffer;
}

/** Resize longest edge to `maxEdge`, preserving aspect ratio, never upscaling. */
const resizeLongestEdge = (input: Buffer, maxEdge: number): Promise<Buffer> =>
  sharp(input)
    // Bake EXIF orientation into the pixels — sharp strips EXIF on re-encode, so
    // without this a rotated phone photo would render sideways in the rendition.
    .rotate()
    .resize(maxEdge, maxEdge, { fit: 'inside', withoutEnlargement: true })
    // No format method: sharp keeps the input format, so output ext === input ext.
    .toBuffer();

/** Encode a blur-hash from a tiny downscaled RGBA version of the image. */
const encodeBlurHash = async (input: Buffer): Promise<string> => {
  const { data, info } = await sharp(input)
    // Match the rendered orientation so the placeholder isn't rotated vs the image.
    .rotate()
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

/** Read dimensions + generate the medium, thumb, and blur-hash for one image. */
const buildRenditions = async (input: Buffer): Promise<Renditions> => {
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    throw new Error('Could not read image dimensions.');
  }
  // `metadata()` reports the pre-orientation sensor size. Since the renditions
  // are auto-rotated (see resizeLongestEdge), store the DISPLAY dimensions:
  // EXIF orientations 5–8 rotate 90°, so width/height swap.
  const swapDims = (meta.orientation ?? 1) >= 5;
  const width = swapDims ? meta.height : meta.width;
  const height = swapDims ? meta.width : meta.height;
  const [medium, thumb, blurHash] = await Promise.all([
    resizeLongestEdge(input, MEDIUM_MAX_EDGE),
    resizeLongestEdge(input, THUMB_MAX_EDGE),
    encodeBlurHash(input),
  ]);
  return { width, height, blurHash, medium, thumb };
};

// ─── GCS helpers ─────────────────────────────────────────────────────────────

const createStorage = (gcpKeyPath?: string): Storage =>
  gcpKeyPath ? new Storage({ keyFilename: gcpKeyPath }) : new Storage();

const getDownloadUrl = (bucket: string, storagePath: string): string =>
  `https://storage.googleapis.com/${bucket}/${storagePath}`;

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

const makeClient = (args: ImageArgs): GraphQLClient =>
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

interface PhotoRow {
  id: string;
  source: string;
  mediumUrl: string;
  thumbnailUrl: string;
  blurHash: string;
  width: number;
  height: number;
  takenAt: string;
  slug: string;
}

/** True if this owner already has a photo with this slug. */
const photoExists = async (args: ImageArgs, slug: string): Promise<boolean> => {
  const data = await makeClient(args).request<{ photos: { id: string }[] }>(
    FIND_PHOTO_QUERY,
    { userId: args.userId, slug },
  );
  return data.photos.length > 0;
};

/** Insert one photos row. */
const createPhoto = async (args: ImageArgs, row: PhotoRow): Promise<string> => {
  const data = await makeClient(args).request<{
    insert_photos_one: { id: string };
  }>(CREATE_PHOTO_MUTATION, {
    object: {
      id: row.id,
      source: row.source,
      mediumUrl: row.mediumUrl,
      thumbnailUrl: row.thumbnailUrl,
      blurHash: row.blurHash,
      width: row.width,
      height: row.height,
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
 * free position. The cover (`thumbnail_url`) is set to the first photo's thumb
 * when the album is created — an existing album keeps its own cover.
 */
const resolveAlbum = async (
  args: ImageArgs,
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

/** Link one photo into the album at `position`. */
const linkPhoto = async (
  args: ImageArgs,
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

/** Ingest one image: derive metadata, dup-check, process, upload, insert. */
const ingestOne = async (
  args: ImageArgs,
  bucket: Bucket | undefined,
  localFile: string,
  seenSlugs: Set<string>,
): Promise<IngestResult> => {
  let meta: ImageMeta;
  try {
    meta = deriveMeta(localFile);
  } catch (error) {
    console.error(
      `  ✗ ${path.basename(localFile)}: ${(error as Error).message}`,
    );
    return { outcome: 'failed' };
  }

  const contentType = CONTENT_TYPE_BY_EXT[meta.ext];
  if (!contentType) {
    console.error(
      `  ✗ ${path.basename(localFile)}: unsupported extension ${meta.ext}.`,
    );
    return { outcome: 'failed' };
  }

  // Two different files can slugify to the same key (e.g. `10639.jpg` and
  // `10639.png`). Since slug is the dup-check key, the second would otherwise be
  // silently swallowed as a "duplicate" and its pixels lost — surface it loudly
  // as a failure so the operator renames one instead.
  if (seenSlugs.has(meta.slug)) {
    console.error(
      `  ✗ ${path.basename(localFile)}: slug "${meta.slug}" collides with another file in this batch — rename to ingest both.`,
    );
    return { outcome: 'failed' };
  }
  seenSlugs.add(meta.slug);

  const takenAt = await resolveTakenAt(localFile);

  if (args.dryRun) {
    console.log(`  • ${path.basename(localFile)} (slug: ${meta.slug})`);
    console.log(`      taken_at: ${takenAt}`);
    console.log(
      `      would upload → photos/${args.userId}/<photoId>/{original,medium,thumb}${meta.ext}`,
    );
    console.log(
      `      would insert photos row (public: ${args.isPublic})${args.album ? ` and link into album "${args.album}"` : ''}`,
    );
    return { outcome: 'dry-run' };
  }

  // Skip rather than create a duplicate for the same owner + slug.
  if (!args.skipDb && (await photoExists(args, meta.slug))) {
    console.warn(`  ⚠ ${meta.slug} — already exists, skipping.`);
    return { outcome: 'skipped' };
  }

  // bucket is only undefined on a dry run, which returned above.
  if (!bucket) throw new Error('Storage bucket not initialised.');

  const photoId = uuidv4();
  const input = readFileSync(localFile);
  const renditions = await buildRenditions(input);

  const dir = `photos/${args.userId}/${photoId}`;
  const originalPath = `${dir}/original${meta.ext}`;
  const mediumPath = `${dir}/medium${meta.ext}`;
  const thumbPath = `${dir}/thumb${meta.ext}`;

  await Promise.all([
    uploadBuffer(bucket, input, originalPath, contentType),
    uploadBuffer(bucket, renditions.medium, mediumPath, contentType),
    uploadBuffer(bucket, renditions.thumb, thumbPath, contentType),
  ]);
  console.log(`  ↑ ${dir}/{original,medium,thumb}${meta.ext}`);

  if (args.skipDb) {
    console.log(
      `  ✓ ${meta.slug} (${renditions.width}×${renditions.height}, uploaded, DB skipped)`,
    );
    return { outcome: 'created' };
  }

  const thumbnailUrl = getDownloadUrl(args.gcpBucket, thumbPath);
  const id = await createPhoto(args, {
    id: photoId,
    source: getDownloadUrl(args.gcpBucket, originalPath),
    mediumUrl: getDownloadUrl(args.gcpBucket, mediumPath),
    thumbnailUrl,
    blurHash: renditions.blurHash,
    width: renditions.width,
    height: renditions.height,
    takenAt,
    slug: meta.slug,
  });

  console.log(
    `  ✓ ${meta.slug} (${renditions.width}×${renditions.height}) → ${id}`,
  );
  return { outcome: 'created', photo: { id, thumbnailUrl } };
};

// ─── Image command ───────────────────────────────────────────────────────────

const handleImage = async (rawArgs: string[]): Promise<void> => {
  const args = parseImageArgs(rawArgs);
  const files = collectFiles(args);

  console.log('=== Image Ingest (Look) ===');
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

  // The album is resolved once, off the FIRST created photo (whose thumb becomes
  // the album cover), then reused with a running position for the rest of the
  // batch. Linking is off under --dry-run and --skip-db (no photo row to link).
  if (args.album && args.skipDb) {
    console.warn(
      'Note: --album is ignored with --skip-db (no photos row is created to link).',
    );
  }

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
    console.log('sworld-cli - Ingest a local image file into the Look library');
    console.log('');
    console.log('Config is shared with the video/audio CLIs and set via');
    console.log('stream-m3u8.ts (~/.sworld-cli/config.json).');
    console.log('');
    console.log('Usage:');
    console.log('  image.ts --file ./photo.jpg [options]');
    console.log("  image.ts --dir ./album --album 'My Album' [options]");
    console.log('');
    console.log('Options:');
    console.log(
      '  --file <path>       Local image to ingest (.jpg/.jpeg/.png/.webp)',
    );
    console.log(
      '  --dir <path>        Ingest every image in a folder (filename order)',
    );
    console.log(
      "  --album <name>      Find-or-create a 'look' album and link each photo",
    );
    console.log(
      '  --public            Mark the photo(s) public (default: private)',
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

  handleImage(args)
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
