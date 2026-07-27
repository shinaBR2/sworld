import {
  createReadStream,
  createWriteStream,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import ffmpeg from 'fluent-ffmpeg';
import {
  cleanupDirectory,
  createDirectory,
  generateTempDir,
} from 'src/services/videos/helpers/file';
import { fetchWithError } from 'src/utils/fetch';
import { systemConfig } from 'src/utils/systemConfig';
import { videoConfig } from '../config';
import { EMPTY_SEGMENT_MAX_BYTES } from './selectFmp4Parts';
import type { Fmp4Artifacts, RepackagePort, RepackageSource } from './types';

// ffmpeg resolves from PATH — apt-installed (>= 7) in the compute image, system
// ffmpeg on the host for the CLI (SWO-633/637).

const INIT_FILENAME = 'init.mp4';
const PLAYLIST_NAME = 'playlist.m3u8';

// Segment/init cut is fMP4/CMAF for both source kinds; the difference is codec
// handling. A stored `.ts` re-encodes audio to AAC (regenerates a clean
// AudioSpecificConfig — the fix for the hls.js MPEG-TS demux noise), while
// already-fMP4 parts are copied losslessly (a pure recovery, no re-encode).
const HLS_URL_OUTPUT_OPTIONS = [
  '-c:v',
  'copy',
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
  INIT_FILENAME,
];
const FMP4_PARTS_OUTPUT_OPTIONS = [
  '-c',
  'copy',
  '-hls_time',
  '6',
  '-hls_playlist_type',
  'vod',
  '-hls_segment_type',
  'fmp4',
  '-hls_fmp4_init_filename',
  INIT_FILENAME,
];

const runFfmpeg = (
  inputPath: string,
  outputOptions: string[],
  playlistPath: string,
): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(outputOptions)
      .format('hls')
      .output(playlistPath)
      .on('end', () => resolve())
      .on('error', (err, _stdout, stderr) =>
        reject(
          new Error(
            `ffmpeg fMP4 remux failed: ${err.message}\n${stderr ?? ''}`,
          ),
        ),
      )
      .run();
  });

/**
 * A Transform that fails the stream once more than `limit` bytes have passed
 * through — enforces the size cap on the ACTUAL bytes received, so a response
 * with a missing or lying `content-length` can't write an unbounded file.
 */
const cappedAt = (limit: number): Transform => {
  let total = 0;
  return new Transform({
    transform(chunk, _encoding, callback) {
      total += chunk.length;
      if (total > limit) {
        callback(new Error('fMP4 part exceeds the max file size'));
        return;
      }
      callback(null, chunk);
    },
  });
};

/**
 * Concatenate the fMP4 parts (init + non-empty segments, in order) into one
 * file. The init already embeds the first fragment's media on the affected
 * videos, so the concatenation is a valid fMP4 byte stream ffmpeg can re-segment
 * (SWO-639, the Infinix recovery).
 *
 * Each part is streamed straight into the combined file in append mode. Not the
 * shared `downloadFile` helper: this appends (that writes a fresh file) and,
 * more importantly, `pipeline` resolves only after the write has flushed and
 * closed — so every part is fully on disk before ffmpeg reads the result, and a
 * mid-write stream error surfaces as a rejection rather than an unhandled crash.
 * `fetchWithError` bounds each fetch with the external-request timeout (a stalled
 * download can't hang the task) and classifies 4xx/5xx; `cappedAt` enforces the
 * size limit on the real byte count.
 */
const concatParts = async (
  partUrls: string[],
  workDir: string,
): Promise<string> => {
  const combinedPath = path.join(workDir, 'combined.mp4');
  for (const url of partUrls) {
    const response = await fetchWithError(url, {
      timeout: systemConfig.defaultExternalRequestTimeout,
    });
    if (!response.body) {
      throw new Error(`Empty response body for ${url}`);
    }
    await pipeline(
      Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
      cappedAt(videoConfig.maxFileSize),
      createWriteStream(combinedPath, { flags: 'a' }),
    );
  }
  return combinedPath;
};

const segmentIndex = (name: string): number =>
  Number(name.match(/\d+/)?.[0] ?? 0);

const readArtifacts = (outputDir: string): Fmp4Artifacts => {
  const segmentNames = readdirSync(outputDir)
    .filter((name) => name.endsWith('.m4s'))
    .sort((a, b) => segmentIndex(a) - segmentIndex(b));

  // Fail hard on ANY empty (moof-only, <= 24-byte) output segment rather than
  // dropping it: the manifest (`playlistContent`) references every segment
  // ffmpeg wrote, so silently omitting one from the upload would ship a
  // rendition whose manifest points at a missing object. With ffmpeg >= 7 (both
  // callers enforce it) the valid paths never emit one; an empty segment means
  // either a media-less init remuxed alone or a pre-7 ffmpeg reintroducing the
  // very empty-first-segment bug this fix removes — both must fail, not ship
  // (SWO-633/639).
  for (const name of segmentNames) {
    if (statSync(path.join(outputDir, name)).size <= EMPTY_SEGMENT_MAX_BYTES) {
      throw new Error(
        `Remux produced an empty segment (${name}) — no playable media`,
      );
    }
  }

  return {
    init: {
      name: INIT_FILENAME,
      stream: createReadStream(path.join(outputDir, INIT_FILENAME)),
    },
    segments: segmentNames.map((name) => ({
      name,
      stream: createReadStream(path.join(outputDir, name)),
    })),
    playlistContent: readFileSync(path.join(outputDir, PLAYLIST_NAME), 'utf-8'),
  };
};

/**
 * Real {@link RepackagePort}: remux a {@link RepackageSource} into fMP4/CMAF in
 * a temp dir. Returns lazily-opened file streams (a whole video never sits in
 * memory) plus a `cleanup()` for the temp dir. Shared by the compute route and
 * the CLI so the recovery recipe lives in exactly one place.
 */
const buildFfmpegRepackage = (): RepackagePort => ({
  repackageToFmp4: async (source: RepackageSource) => {
    const tempDir = generateTempDir();
    try {
      const outputDir = path.join(tempDir, 'out');
      await createDirectory(outputDir);
      const playlistPath = path.join(outputDir, PLAYLIST_NAME);

      if (source.kind === 'hls-url') {
        await runFfmpeg(source.url, HLS_URL_OUTPUT_OPTIONS, playlistPath);
      } else {
        const combinedPath = await concatParts(source.partUrls, tempDir);
        await runFfmpeg(combinedPath, FMP4_PARTS_OUTPUT_OPTIONS, playlistPath);
      }

      return {
        artifacts: readArtifacts(outputDir),
        cleanup: () => cleanupDirectory(tempDir),
      };
    } catch (error) {
      // Any failure here happens before `cleanup` is handed back, so the engine
      // never gets a chance to remove the temp dir — clean it up ourselves.
      await cleanupDirectory(tempDir);
      throw error;
    }
  },
});

export { buildFfmpegRepackage };
