import { createReadStream, readdirSync, readFileSync, statSync } from 'node:fs';
import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import ffmpeg from 'fluent-ffmpeg';
import {
  cleanupDirectory,
  createDirectory,
  downloadFile,
  generateTempDir,
} from 'src/services/videos/helpers/file';
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
 * Concatenate the fMP4 parts (init + non-empty segments, in order) into one
 * file. The init already embeds the first fragment's media on the affected
 * videos, so the concatenation is a valid fMP4 byte stream ffmpeg can re-segment
 * (SWO-639, the Infinix recovery).
 *
 * Each part is a single fMP4 fragment (small by construction), so a
 * read-into-memory append keeps the concat simple and — unlike a persistent
 * write stream — has no mid-write `error` event that could crash the process
 * unhandled. Downloads reuse the shared `downloadFile` helper (size-limit guard
 * + partial-file cleanup).
 */
const concatParts = async (
  partUrls: string[],
  workDir: string,
): Promise<string> => {
  const combinedPath = path.join(workDir, 'combined.mp4');
  for (let i = 0; i < partUrls.length; i++) {
    const partPath = path.join(workDir, `part-${i}`);
    await downloadFile(partUrls[i], partPath);
    await appendFile(combinedPath, await readFile(partPath));
  }
  return combinedPath;
};

const segmentIndex = (name: string): number =>
  Number(name.match(/\d+/)?.[0] ?? 0);

const readArtifacts = (outputDir: string): Fmp4Artifacts => {
  const segmentNames = readdirSync(outputDir)
    .filter((name) => name.endsWith('.m4s'))
    // Drop any empty (moof-only, <= 24-byte) output segment. With ffmpeg >= 7
    // the valid paths never produce one; an empty segment appears only when a
    // media-less init was remuxed alone — dropping it collapses to the engine's
    // "no segments" failure instead of re-shipping the empty-first-segment bug
    // this whole fix exists to remove (SWO-633/639).
    .filter(
      (name) =>
        statSync(path.join(outputDir, name)).size > EMPTY_SEGMENT_MAX_BYTES,
    )
    .sort((a, b) => segmentIndex(a) - segmentIndex(b));

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
