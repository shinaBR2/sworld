#!/usr/bin/env tsx

/**
 * CLI tool to INGEST a Google Photos **Takeout** export into the Look library.
 *
 * This is the Takeout-aware sibling of `image.ts`. Where `image.ts` ingests a
 * bare `--file`/`--dir` of local images, this one understands the *shape* of a
 * Takeout `Google Photos/` folder and the per-photo `*.supplemental-metadata.json`
 * sidecars Google ships alongside each image — so a future export is a one-liner.
 *
 * Two things make Takeout different from a plain folder of images:
 *
 *   1. **The date lives in a sidecar, not (always) in EXIF.** Google writes a
 *      `<image>.supplemental-metadata.json` next to every photo whose
 *      `photoTakenTime` is the exact timestamp Google Photos uses for its own
 *      timeline. EXIF `DateTimeOriginal` is present for most photos but *missing*
 *      for a meaningful minority — screenshots, panoramas, downloaded/edited
 *      copies. `image.ts` would silently store those with the file's mtime (i.e.
 *      the download date). Here the resolution order is:
 *
 *          sidecar photoTakenTime  →  EXIF DateTimeOriginal  →  file mtime
 *
 *      and every photo reports which source it used, so nothing lands in the
 *      wrong place without a trace.
 *
 *   2. **The folder layout encodes albums.** Under the Takeout `Google Photos/`
 *      root, a folder is one of two kinds:
 *        - `Photos from YYYY` — Google's automatic date buckets. Ingested LOOSE
 *          (no album); Look's timeline orders them by their (now-correct) date.
 *          Pass `--year-albums` to instead make each an album titled `YYYY`.
 *        - anything else (e.g. `Hồ Than Thở`) — a real album you made. Becomes a
 *          Look album whose title is the folder name.
 *
 * Everything downstream — renditions (thumb + medium + blur-hash), GCS upload to
 * `photos/<userId>/<photoId>/{original,medium,thumb}.<ext>`, and the `insert_photos_one`
 * row — matches `image.ts` exactly, so photos ingested by either tool look identical.
 *
 * Dedup is by owner + slug: a photo Google placed in both an album and a year
 * bucket (Takeout duplicates it into each folder) is uploaded once; the second
 * sighting just links the existing photo into the album. Re-runs are idempotent.
 * Limitation of that model: two GENUINELY different photos that happen to share a
 * filename across folders (e.g. a camera counter reused years apart) slugify alike,
 * so the second is treated as the first and skipped. Each skip prints a `⚠ … already
 * imported, reusing` line and lands in the `Existed` count — sanity-check that count
 * against how many cross-folder duplicates you actually expect.
 *
 * Setup reuses the same `~/.sworld-cli/config.json` as the video/audio/image CLIs
 * (gcp-key, gcp-bucket, hasura-endpoint, hasura-secret, user-id). Configure it
 * once via `stream-m3u8.ts config set <key> <value>`.
 *
 * Usage:
 *   npx tsx src/cli/google-photos.ts --takeout "~/Downloads/Takeout/Google Photos" [options]
 *   npx tsx src/cli/google-photos.ts --dir ./one-folder --album 'My Album' [options]
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

/** A Takeout year bucket: `Photos from 2017`. Not a real album unless asked. */
const YEAR_FOLDER_RE = /^Photos from (\d{4})$/;

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

/** Expand a leading `~` to the home dir so `--takeout ~/…` works from any shell. */
const expandHome = (p: string): string =>
  p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;

// ─── Argument parsing ────────────────────────────────────────────────────────

interface GooglePhotosArgs {
  takeout?: string;
  dir?: string;
  album?: string;
  yearAlbums: boolean;
  isPublic: boolean;
  userId: string;
  skipDb: boolean;
  dryRun: boolean;
  gcpKeyPath?: string;
  gcpBucket: string;
  hasuraEndpoint: string;
  hasuraSecret: string;
}

const parseArgs = (rawArgs: string[]): GooglePhotosArgs => {
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

  const takeout = get('--takeout');
  const dir = get('--dir');
  if (takeout && dir) {
    console.error('Error: use --takeout OR --dir, not both.');
    process.exit(1);
  }
  if (!takeout && !dir) {
    console.error(
      "Error: point at a Takeout root with --takeout <path> (the 'Google Photos' folder), or a single folder with --dir <path>.",
    );
    process.exit(1);
  }
  const resolvedTakeout = takeout ? expandHome(takeout) : undefined;
  const resolvedDir = dir ? expandHome(dir) : undefined;
  if (resolvedTakeout && !existsSync(resolvedTakeout)) {
    console.error(`Error: Takeout folder not found: ${resolvedTakeout}`);
    process.exit(1);
  }
  if (resolvedDir && !existsSync(resolvedDir)) {
    console.error(`Error: Directory not found: ${resolvedDir}`);
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
    takeout: resolvedTakeout,
    dir: resolvedDir,
    // Normalize at the source: a blank/whitespace value is treated as unset.
    album: get('--album')?.trim() || undefined,
    yearAlbums: has('--year-albums'),
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

/** The images in one folder, in filename (natural/numeric) order — the album order. */
const imagesInFolder = (dir: string): string[] =>
  readdirSync(dir)
    .filter(
      (name) =>
        IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()) &&
        statSync(path.join(dir, name)).isFile(),
    )
    .map((name) => path.join(dir, name))
    // `img2` sorts before `img10`, not after — and this ordering is the album's.
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

/** Media Look can't take (video, HEIC, …), for the skipped-files report. */
const skippedMediaInFolder = (dir: string): string[] =>
  readdirSync(dir).filter((name) => {
    const ext = path.extname(name).toLowerCase();
    return (
      ext !== '.json' &&
      !IMAGE_EXTENSIONS.has(ext) &&
      statSync(path.join(dir, name)).isFile()
    );
  });

// ─── Takeout sidecar → taken-at ──────────────────────────────────────────────

/**
 * Find the `*.supplemental-metadata.json` sidecar for an image, tolerating the
 * two ways Takeout mangles the name:
 *   - duplicate counter: `foo(1).jpg`  → `foo.jpg.supplemental-metadata(1).json`
 *   - long-name truncation: Google caps the sidecar filename, so it becomes a
 *     PREFIX of the ideal name. Matched by a per-directory scan as a last resort.
 * Returns null when no plausible sidecar exists (caller falls back to EXIF/mtime).
 */
const dirJsonCache = new Map<string, string[]>();
const jsonFilesIn = (dir: string): string[] => {
  const cached = dirJsonCache.get(dir);
  if (cached) return cached;
  const list = readdirSync(dir).filter((n) =>
    n.toLowerCase().endsWith('.json'),
  );
  dirJsonCache.set(dir, list);
  return list;
};

const findSidecar = (imgPath: string): string | null => {
  const dir = path.dirname(imgPath);
  const base = path.basename(imgPath);

  const candidates = [
    `${base}.supplemental-metadata.json`,
    // Older/shorter Takeout exports abbreviate the suffix.
    `${base}.suppl.json`,
  ];
  // `name(1).jpg` → the counter migrates to just before `.json`.
  const dup = base.match(/^(.*)\((\d+)\)(\.[^.]+)$/);
  if (dup) {
    candidates.push(
      `${dup[1]}${dup[3]}.supplemental-metadata(${dup[2]}).json`,
      `${dup[1]}${dup[3]}.suppl(${dup[2]}).json`,
    );
  }
  for (const name of candidates) {
    const full = path.join(dir, name);
    if (existsSync(full)) return full;
  }

  // Truncation fallback: Google caps the sidecar filename, so it becomes a PREFIX
  // of `${base}.supplemental-metadata`. A prefix match alone could grab a *neighbour*
  // whose long name shares the same leading chars, so we confirm identity against the
  // sidecar's own `title` field (the original filename) before trusting it — an exact
  // check, not a fuzzy one. Longest prefix first so the best candidate is verified first.
  const idealCore = `${base}.supplemental-metadata`;
  const prefixMatches = jsonFilesIn(dir)
    .map((name) => {
      let core = name.slice(0, -'.json'.length);
      const c = core.match(/\((\d+)\)$/);
      if (c) core = core.slice(0, c.index);
      return { name, core };
    })
    .filter(({ core }) => core.length >= 40 && idealCore.startsWith(core))
    .sort((a, b) => b.core.length - a.core.length);

  for (const { name } of prefixMatches) {
    const full = path.join(dir, name);
    if (sidecarTitle(full) === base) return full;
  }
  return null;
};

/** The `title` (original filename) a sidecar records, or null if unreadable. */
const sidecarTitle = (sidecarPath: string): string | null => {
  try {
    return JSON.parse(readFileSync(sidecarPath, 'utf-8'))?.title ?? null;
  } catch {
    return null;
  }
};

type DateSource = 'sidecar' | 'exif' | 'mtime';

/**
 * Resolve `taken_at` with a Takeout-aware order:
 *   sidecar photoTakenTime (Google's own timeline date, 100% coverage in Takeout)
 *   → EXIF DateTimeOriginal → file mtime (last resort; usually the download date).
 * Returns the ISO date AND which source won, for the end-of-run report.
 */
const resolveTakenAt = async (
  filePath: string,
): Promise<{ takenAt: string; source: DateSource }> => {
  const sidecar = findSidecar(filePath);
  if (sidecar) {
    try {
      const json = JSON.parse(readFileSync(sidecar, 'utf-8'));
      const ts = Number(json?.photoTakenTime?.timestamp);
      if (Number.isFinite(ts) && ts > 0) {
        return {
          takenAt: new Date(ts * 1000).toISOString(),
          source: 'sidecar',
        };
      }
    } catch {
      // Malformed sidecar — fall through to EXIF.
    }
  }

  try {
    const exif = await exifr.parse(filePath, { pick: ['DateTimeOriginal'] });
    const original = exif?.DateTimeOriginal;
    if (original instanceof Date && !Number.isNaN(original.getTime())) {
      return { takenAt: original.toISOString(), source: 'exif' };
    }
  } catch {
    // A malformed/absent EXIF block is expected — fall through to mtime.
  }

  return { takenAt: statSync(filePath).mtime.toISOString(), source: 'mtime' };
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

const makeClient = (args: GooglePhotosArgs): GraphQLClient =>
  new GraphQLClient(args.hasuraEndpoint, {
    headers: { 'x-hasura-admin-secret': args.hasuraSecret },
  });

const FIND_PHOTO_QUERY = `
  query FindPhoto($userId: uuid!, $slug: String!) {
    photos(where: { user_id: { _eq: $userId }, slug: { _eq: $slug } }, limit: 1) {
      id
      thumbnailUrl
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

const FIND_LINK_QUERY = `
  query FindLink($playlistId: uuid!, $photoId: uuid!) {
    playlist_photos(
      where: { playlist_id: { _eq: $playlistId }, photo_id: { _eq: $photoId } }
      limit: 1
    ) {
      playlist_id
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

/** The existing photo for this owner+slug (id + thumb), or null if none. */
const findPhoto = async (
  args: GooglePhotosArgs,
  slug: string,
): Promise<{ id: string; thumbnailUrl: string } | null> => {
  const data = await makeClient(args).request<{
    photos: { id: string; thumbnailUrl: string }[];
  }>(FIND_PHOTO_QUERY, { userId: args.userId, slug });
  return data.photos[0] ?? null;
};

/** Insert one photos row. */
const createPhoto = async (
  args: GooglePhotosArgs,
  row: PhotoRow,
): Promise<string> => {
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
  args: GooglePhotosArgs,
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

/** True if this photo is already linked into this album (keeps re-runs idempotent). */
const isLinked = async (
  args: GooglePhotosArgs,
  playlistId: string,
  photoId: string,
): Promise<boolean> => {
  const data = await makeClient(args).request<{
    playlist_photos: { playlist_id: string }[];
  }>(FIND_LINK_QUERY, { playlistId, photoId });
  return data.playlist_photos.length > 0;
};

/** Link one photo into the album at `position`. */
const linkPhoto = async (
  args: GooglePhotosArgs,
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

type IngestOutcome = 'created' | 'existed' | 'dry-run' | 'failed';

interface IngestResult {
  outcome: IngestOutcome;
  /** The photo row (new or pre-existing) — drives album linking. */
  photo?: { id: string; thumbnailUrl: string };
  source?: DateSource;
}

/** Ingest one image: resolve date, dup-check, process, upload, insert. */
const ingestOne = async (
  args: GooglePhotosArgs,
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

  // Two different files in ONE folder can slugify to the same key (e.g.
  // `10639.jpg` and `10639.png`). Since slug is the dup-check key, the second
  // would otherwise be silently swallowed and its pixels lost — surface it loudly
  // so the operator renames one. (Cross-folder same-name is a different case —
  // the same Takeout photo in an album + a year bucket — handled by the DB check.)
  if (seenSlugs.has(meta.slug)) {
    console.error(
      `  ✗ ${path.basename(localFile)}: slug "${meta.slug}" collides with another file in this folder — rename to ingest both.`,
    );
    return { outcome: 'failed' };
  }
  seenSlugs.add(meta.slug);

  if (args.dryRun) {
    const { takenAt, source } = await resolveTakenAt(localFile);
    console.log(`  • ${path.basename(localFile)} (slug: ${meta.slug})`);
    console.log(`      taken_at: ${takenAt}  [${source}]`);
    return { outcome: 'dry-run', source };
  }

  // Already imported (same owner + slug): don't re-upload, and don't re-resolve the
  // date — return the existing row (with no `source`) so it's excluded from the
  // date report yet can still be linked into this album by the caller.
  if (!args.skipDb) {
    const existing = await findPhoto(args, meta.slug);
    if (existing) {
      console.warn(`  ⚠ ${meta.slug} — already imported, reusing.`);
      return { outcome: 'existed', photo: existing };
    }
  }

  // bucket is only undefined on a dry run, which returned above.
  if (!bucket) throw new Error('Storage bucket not initialised.');

  const { takenAt, source } = await resolveTakenAt(localFile);

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
    return { outcome: 'created', source };
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
    `  ✓ ${meta.slug} (${renditions.width}×${renditions.height}) [${source}] → ${id}`,
  );
  return { outcome: 'created', photo: { id, thumbnailUrl }, source };
};

// ─── Per-folder ingest ───────────────────────────────────────────────────────

interface Tallies {
  outcome: Record<IngestOutcome, number>;
  source: Record<DateSource, number>;
  /** Photos that fell all the way back to mtime — i.e. a real date we couldn't find. */
  mtimeFallback: string[];
  /** Non-image media we skipped (video, HEIC, …), by extension. */
  skipped: Record<string, number>;
}

/**
 * Ingest every image in one folder. `albumName` is null for a loose folder
 * (year bucket without --year-albums); otherwise photos are linked into that
 * album in filename order. The album is resolved lazily off the first photo
 * (new or pre-existing) so its thumb can seed the album cover.
 */
const ingestFolder = async (
  args: GooglePhotosArgs,
  bucket: Bucket | undefined,
  folder: string,
  albumName: string | null,
  tallies: Tallies,
): Promise<void> => {
  const files = imagesInFolder(folder);

  for (const media of skippedMediaInFolder(folder)) {
    const ext = path.extname(media).toLowerCase();
    tallies.skipped[ext] = (tallies.skipped[ext] ?? 0) + 1;
  }

  const label = albumName ? `album "${albumName}"` : 'loose (no album)';
  console.log(
    `\n── ${path.basename(folder)} → ${label} (${files.length} images)`,
  );

  // Per-folder slug guard: only catches two DISTINCT files in THIS folder that
  // slugify alike. The same photo appearing across folders is deduped by the DB.
  const seenSlugs = new Set<string>();
  let albumState: { id: string; nextPosition: number } | undefined;

  for (const localFile of files) {
    // One bad file in a folder shouldn't abort the rest — record it and move on.
    try {
      const result = await ingestOne(args, bucket, localFile, seenSlugs);
      if (result.source) tallies.source[result.source] += 1;
      if (result.source === 'mtime') {
        tallies.mtimeFallback.push(
          path.relative(args.takeout ?? folder, localFile),
        );
      }

      // Link into the album (real album folders only; loose folders skip this).
      // Works for both freshly-created and pre-existing photos, so a photo Google
      // filed in several albums lands in each. Skipped under --skip-db (no row).
      if (albumName && result.photo && !args.skipDb) {
        if (!albumState) {
          albumState = await resolveAlbum(
            args,
            albumName,
            result.photo.thumbnailUrl,
          );
        }
        if (!(await isLinked(args, albumState.id, result.photo.id))) {
          await linkPhoto(
            args,
            albumState.id,
            result.photo.id,
            albumState.nextPosition,
          );
          albumState.nextPosition += 1;
        }
      }

      tallies.outcome[result.outcome] += 1;
    } catch (error) {
      console.error(
        `  ✗ ${path.basename(localFile)}: ${(error as Error).message}`,
      );
      tallies.outcome.failed += 1;
    }
  }
};

// ─── Takeout traversal ───────────────────────────────────────────────────────

interface FolderPlan {
  folder: string;
  albumName: string | null;
}

/**
 * Classify the immediate subfolders of a Takeout `Google Photos/` root:
 *   - `Photos from YYYY` → loose (albumName null), or an album `YYYY` under
 *     --year-albums.
 *   - anything else → a real album titled by the folder name.
 * Named albums are planned first so that when a photo lives in both an album and
 * a year bucket, the album owns it and the year copy just dedups.
 */
const planTakeout = (root: string, yearAlbums: boolean): FolderPlan[] => {
  const entries = readdirSync(root)
    .filter((name) => statSync(path.join(root, name)).isDirectory())
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const named: FolderPlan[] = [];
  const years: FolderPlan[] = [];
  for (const name of entries) {
    const folder = path.join(root, name);
    const yearMatch = name.match(YEAR_FOLDER_RE);
    if (yearMatch) {
      years.push({ folder, albumName: yearAlbums ? yearMatch[1] : null });
    } else {
      named.push({ folder, albumName: name });
    }
  }
  return [...named, ...years];
};

// ─── Command ─────────────────────────────────────────────────────────────────

const handle = async (rawArgs: string[]): Promise<void> => {
  const args = parseArgs(rawArgs);

  // Build the list of (folder, albumName) to ingest.
  const plan: FolderPlan[] = args.takeout
    ? planTakeout(args.takeout, args.yearAlbums)
    : [{ folder: args.dir as string, albumName: args.album ?? null }];

  console.log('=== Google Photos Ingest (Look) ===');
  console.log(`  Source:     ${args.takeout ?? args.dir}`);
  console.log(
    `  Mode:       ${args.takeout ? 'Takeout root' : 'single folder'}`,
  );
  console.log(`  Folders:    ${plan.length}`);
  console.log(`  Year albums:${args.yearAlbums}`);
  console.log(`  User ID:    ${args.userId}`);
  console.log(`  GCP Bucket: ${args.gcpBucket}`);
  console.log(
    `  GCP Key:    ${args.gcpKeyPath ? path.basename(args.gcpKeyPath) : 'ADC (default)'}`,
  );
  console.log(`  Public:     ${args.isPublic}`);
  console.log(`  Dry run:    ${args.dryRun}`);
  console.log(`  Skip DB:    ${args.skipDb}`);

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

  const tallies: Tallies = {
    outcome: { created: 0, existed: 0, 'dry-run': 0, failed: 0 },
    source: { sidecar: 0, exif: 0, mtime: 0 },
    mtimeFallback: [],
    skipped: {},
  };

  for (const { folder, albumName } of plan) {
    await ingestFolder(args, bucket, folder, albumName, tallies);
  }

  // ─── Report ────────────────────────────────────────────────────────────────
  console.log('\n=== Done ===');
  console.log(
    `  Created: ${tallies.outcome.created}  Existed: ${tallies.outcome.existed}  Planned: ${tallies.outcome['dry-run']}  Failed: ${tallies.outcome.failed}`,
  );
  console.log(
    `  Dates → sidecar: ${tallies.source.sidecar}  exif: ${tallies.source.exif}  mtime: ${tallies.source.mtime}`,
  );

  if (tallies.mtimeFallback.length > 0) {
    console.log(
      `\n  ⚠ ${tallies.mtimeFallback.length} photo(s) had no sidecar and no EXIF — dated by file mtime (likely wrong):`,
    );
    for (const f of tallies.mtimeFallback) console.log(`      ${f}`);
  }

  const skippedEntries = Object.entries(tallies.skipped);
  if (skippedEntries.length > 0) {
    const summary = skippedEntries.map(([ext, n]) => `${n}${ext}`).join(', ');
    console.log(
      `\n  Skipped non-image media (Look is images-only): ${summary}`,
    );
  }

  // Non-zero exit if any file failed, so a batch surfaces the failure.
  if (tallies.outcome.failed > 0) {
    throw new Error(`${tallies.outcome.failed} file(s) failed.`);
  }
};

// ─── Main Router ──────────────────────────────────────────────────────────────

const main = (): void => {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--help' || command === '-h') {
    console.log(
      'sworld-cli - Ingest a Google Photos Takeout export into the Look library',
    );
    console.log('');
    console.log('Config is shared with the video/audio/image CLIs and set via');
    console.log('stream-m3u8.ts (~/.sworld-cli/config.json).');
    console.log('');
    console.log('Usage:');
    console.log(
      "  google-photos.ts --takeout '~/Downloads/Takeout/Google Photos' [options]",
    );
    console.log(
      "  google-photos.ts --dir ./one-folder --album 'My Album' [options]",
    );
    console.log('');
    console.log('Options:');
    console.log(
      "  --takeout <path>    A Takeout 'Google Photos' root; auto-classifies each",
    );
    console.log(
      '                      subfolder (named album vs "Photos from YYYY" bucket)',
    );
    console.log(
      '  --dir <path>        Ingest a single folder (album if --album, else loose)',
    );
    console.log(
      '  --album <name>      Album name for --dir (ignored in --takeout mode)',
    );
    console.log(
      "  --year-albums       Make each 'Photos from YYYY' an album titled YYYY",
    );
    console.log(
      '                      (default: year buckets import loose, date-ordered)',
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
    console.log('');
    console.log('Dates resolve: sidecar photoTakenTime → EXIF → file mtime.');
    return;
  }

  handle(args)
    // Exit explicitly on success — GCS keep-alive sockets can otherwise keep the
    // event loop alive for minutes, hanging any batch that waits on this process.
    // flushThenExit drains stdio first so output isn't truncated.
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
