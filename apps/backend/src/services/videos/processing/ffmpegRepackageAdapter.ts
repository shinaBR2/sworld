import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import { rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import ffmpeg from 'fluent-ffmpeg';
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

const downloadTo = async (url: string, dest: string): Promise<void> => {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }
  await pipeline(
    Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
    createWriteStream(dest),
  );
};

/**
 * Concatenate the fMP4 parts (init + non-empty segments, in order) into one
 * file. The init already embeds the first fragment's media on the affected
 * videos, so the concatenation is a valid fMP4 byte stream ffmpeg can re-segment
 * (SWO-639, the Infinix recovery).
 */
const concatParts = async (
  partUrls: string[],
  workDir: string,
): Promise<string> => {
  const combinedPath = path.join(workDir, 'combined.mp4');
  const out = createWriteStream(combinedPath);
  try {
    for (let i = 0; i < partUrls.length; i++) {
      const partPath = path.join(workDir, `part-${i}`);
      await downloadTo(partUrls[i], partPath);
      await new Promise<void>((resolve, reject) => {
        const rs = createReadStream(partPath);
        rs.on('error', reject);
        rs.on('end', () => resolve());
        rs.pipe(out, { end: false });
      });
    }
  } finally {
    await new Promise<void>((resolve) => out.end(resolve));
  }
  return combinedPath;
};

const readArtifacts = (outputDir: string): Fmp4Artifacts => {
  const segmentNames = readdirSync(outputDir)
    .filter((name) => name.endsWith('.m4s'))
    .sort(
      (a, b) =>
        Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0),
    );

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
    const tempDir = mkdtempSync(path.join(os.tmpdir(), 'fmp4-repair-'));
    const outputDir = path.join(tempDir, 'out');
    mkdirSync(outputDir, { recursive: true });
    const playlistPath = path.join(outputDir, PLAYLIST_NAME);

    if (source.kind === 'hls-url') {
      await runFfmpeg(source.url, HLS_URL_OUTPUT_OPTIONS, playlistPath);
    } else {
      const combinedPath = await concatParts(source.partUrls, tempDir);
      await runFfmpeg(combinedPath, FMP4_PARTS_OUTPUT_OPTIONS, playlistPath);
    }

    return {
      artifacts: readArtifacts(outputDir),
      cleanup: async () => {
        await rm(tempDir, { recursive: true, force: true });
      },
    };
  },
});

export { buildFfmpegRepackage };
