import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import ffmpeg, { type FfprobeData } from 'fluent-ffmpeg';
import { existsSync } from 'fs';
import * as path from 'path';
import { getCurrentLogger } from 'src/utils/logger';
import { videoConfig } from '../../config';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * Converts a video file to HLS (HTTP Live Streaming) format
 *
 * @param inputPath - Absolute path to the input video file
 * @param outputDir - Absolute path to the output directory where HLS files will be saved
 * @throws {Error} If input file doesn't exist or conversion fails
 * @returns Promise that resolves when conversion is complete
 */
const convertToHLS = async (
  inputPath: string,
  outputDir: string,
): Promise<void> => {
  const logger = getCurrentLogger();
  if (!existsSync(inputPath)) {
    const error = new Error(`Input file does not exist at "${inputPath}"`);
    logger.error(error, 'Conversion failed');
    throw error;
  }

  if (!path.isAbsolute(inputPath)) {
    const error = new Error('inputPath must be absolute');
    logger.error(error, 'Conversion failed');
    throw error;
  }

  if (!path.isAbsolute(outputDir)) {
    const error = new Error('outputDir must be absolute');
    logger.error(error, 'Conversion failed');
    throw error;
  }

  const outputPath = path.join(outputDir, 'playlist.m3u8');
  logger.debug(
    `[convertToHLS] Converting to HLS: ${inputPath} -> ${outputPath}`,
  );

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        ...videoConfig.ffmpegCommands,
        // ABSOLUTE segment path. ffmpeg resolves `-hls_segment_filename` relative
        // to the process CWD, so a relative name writes every .m4s outside
        // outputDir (they then never get uploaded). The init filename stays
        // relative (config) — ffmpeg places it in this segment dir.
        '-hls_segment_filename',
        path.join(outputDir, '%d.m4s'),
      ])
      .output(outputPath)
      .on('progress', (progress) => {
        logger.debug(progress, '[convertToHLS] Conversion progress:');
      })
      .on('end', () => {
        logger.info('[convertToHLS] HLS conversion completed successfully');
        resolve();
      })
      .on('error', (error, stdout, stderr) => {
        logger.error(
          {
            error: error.message,
            stdout,
            stderr,
          },
          'Conversion failed',
        );
        reject(new Error(`Conversion failed`));
      })
      .run();
  });
};

/**
 * Gets the duration of a video file in seconds
 *
 * @param videoPath - Absolute path to the video file
 * @param logger - Logger instance
 * @returns Promise that resolves with the duration in seconds
 *          Returns 1 if duration cannot be determined
 */
const getDuration = async (videoPath: string): Promise<number> => {
  const logger = getCurrentLogger();
  const DEFAULT_DURATION = 1;

  if (!path.isAbsolute(videoPath)) {
    throw new Error('videoPath must be absolute');
  }

  try {
    if (!existsSync(videoPath)) {
      throw new Error(`Video file does not exist at path: ${videoPath}`);
    }

    const metadata = await new Promise<FfprobeData>((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });

    const duration = metadata.format.duration;

    if (!duration) {
      logger.warn(
        `Could not determine video duration for ${videoPath}, using default`,
      );
      return DEFAULT_DURATION;
    }

    return Math.floor(duration);
  } catch (error) {
    logger.error(error, 'Failed to get video duration:');
    return DEFAULT_DURATION;
  }
};

/**
 * Takes a screenshot from a video file at a specified timestamp
 *
 * @param videoPath - Path to the input video file. Can be absolute (e.g., '/tmp/123456/input.ts')
 *                   or relative to current working directory (e.g., 'workspace/input.ts')
 * @param outputDir - Path to the output directory. Can be absolute (e.g., '/tmp/123456/')
 *                   or relative to current working directory (e.g., 'workspace/')
 * @param filename - Name of the output file without path (e.g., 'abc123--1705042800000.jpg')
 * @param videoDuration - Duration of video in seconds
 * @param isSegment - Whether the input is a video segment (defaults to false)
 *                    When true, sets input format to 'mpegts' for segment processing
 * @returns Promise<void> - Resolves when screenshot is taken, rejects on error
 */
const takeScreenshot = async (
  videoPath: string,
  outputDir: string,
  filename: string,
  videoDuration: number,
  isSegment: boolean = false,
): Promise<void> => {
  const logger = getCurrentLogger();
  const timestamp = Math.min(Math.floor(videoDuration / 3), 10);

  return new Promise((resolve, reject) => {
    const command = ffmpeg(videoPath);
    if (isSegment) {
      command.inputFormat('mpegts');
    }

    command
      .screenshot({
        timestamps: [timestamp],
        folder: outputDir,
        filename: filename,
      })
      .on('end', () => resolve())
      .on('error', (err, stdout, stderr) => {
        logger.error('FFmpeg stdout:', stdout);
        logger.error('FFmpeg stderr:', stderr);
        reject(new Error(`FFmpeg error: ${err.message}`));
      });
  });
};

/**
 * Takes a screenshot from a local video file at an EXACT timestamp.
 *
 * Unlike {@link takeScreenshot} (which derives a fixed default timestamp from
 * the video duration), this seeks to the caller-provided `atSeconds` and grabs
 * a single frame. `-ss` is placed BEFORE the input for a fast keyframe seek,
 * then re-decoded to the requested position — accurate on a short, seekable
 * fMP4 file (init.mp4 + one .m4s concatenated) while staying cheap.
 *
 * `atSeconds` is the ABSOLUTE media time on the file's own timeline. For a
 * concatenated fMP4 segment this is NOT rebased to zero: the fragment keeps its
 * `tfdt` baseMediaDecodeTime, so callers must pass the absolute timestamp (not
 * an in-segment offset) for the seek to land on the requested frame.
 *
 * @param videoPath - Absolute path to a seekable local video file
 * @param outputDir - Absolute path to the output directory
 * @param filename - Output file name without path (e.g. 'thumbnail--123.jpg')
 * @param atSeconds - Absolute seek position on the file's timeline, in seconds
 *                    (clamped to >= 0)
 * @returns Promise<void> - Resolves once the frame is written, rejects on error
 */
const takeScreenshotAtTime = async (
  videoPath: string,
  outputDir: string,
  filename: string,
  atSeconds: number,
): Promise<void> => {
  const logger = getCurrentLogger();
  const seek = Math.max(0, atSeconds);
  const outputPath = path.join(outputDir, filename);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .inputOptions(['-ss', `${seek}`])
      .outputOptions(['-frames:v', '1', '-q:v', '2'])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err, stdout, stderr) => {
        logger.error({ stdout, stderr }, 'takeScreenshotAtTime failed');
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .run();
  });
};

export { convertToHLS, getDuration, takeScreenshot, takeScreenshotAtTime };
