import * as path from 'path';
import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { existsSync } from 'fs';
import { logger } from 'src/utils/logger';
import { promisify } from 'util';
import { Logger } from 'pino';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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
  outputDir: string
): Promise<void> => {
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
    `[convertToHLS] Converting to HLS: ${inputPath} -> ${outputPath}`
  );

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-codec copy', // Copy codec without re-encoding
        '-start_number 0', // Start segment numbering at 0
        '-hls_time 10', // 10 second segment duration
        '-hls_list_size 0', // Keep all segments in playlist
        '-f hls', // HLS output format
      ])
      .output(outputPath)
      .on('progress', progress => {
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
          'Conversion failed'
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
  const DEFAULT_DURATION = 1;

  try {
    if (!existsSync(videoPath)) {
      throw new Error(`Video file does not exist at path: ${videoPath}`);
    }

    if (!path.isAbsolute(videoPath)) {
      throw new Error('videoPath must be absolute');
    }

    const ffprobe = promisify<string, FfprobeData>(ffmpeg.ffprobe);
    const metadata = await ffprobe(videoPath);
    const duration = metadata.format.duration;

    if (!duration) {
      logger.warn(
        `Could not determine video duration for ${videoPath}, using default`
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
 * @param videoPath - Absolute path to the input video file
 *                   (e.g., '/tmp/123456/input.mp4')
 * @param outputDir - Absolute path to the output directory where screenshots will be saved
 *                   (e.g., '/tmp/123456/')
 * @param filename - Name of the output file without path
 *                  (e.g., 'abc123--1705042800000.jpg')
 * @param options - Optional configuration object for screenshot settings
 * @returns Promise<void> - Resolves when screenshot is taken, rejects on error
 */
const takeScreenshot = async (
  videoPath: string,
  outputDir: string,
  filename: string
): Promise<void> => {
  const duration = await getDuration(videoPath);
  const timestamp = Math.min(Math.floor(duration / 3), 10);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
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

export { convertToHLS, getDuration, takeScreenshot };
