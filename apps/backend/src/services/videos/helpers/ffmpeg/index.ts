import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { cleanupDirectory } from '../file';
import { existsSync } from 'fs';
import { logger } from 'src/utils/logger';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface ConversionVideo {
  id: string;
  videoUrl: string;
}

/**
 * Converts video to HLS format using ffmpeg
 */
const convertToHLS = async (
  inputPath: string,
  outputDir: string
): Promise<void> => {
  if (!existsSync(inputPath)) {
    throw new Error('Input file does not exist');
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-codec copy',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls',
      ])
      .output(path.join(outputDir, 'playlist.m3u8'))
      .on('progress', progress => {
        logger.info(`Processing: ${progress.percent}% done`);
      })
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
};

interface ScreenshotOptions {
  timestamp?: string;
}

/**
 * Screenshot video to thumbnail at specified timestamp
 */
const takeScreenshot = async (
  videoPath: string,
  outputDir: string,
  filename: string,
  options: ScreenshotOptions = {}
): Promise<void> => {
  const defaultOptions = {
    timestamp: '00:03:03',
  };
  const finalOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshot({
        timestamps: [finalOptions.timestamp], // Using earlier timestamp for better performance
        folder: outputDir,
        filename: filename,
      })
      .on('end', resolve)
      .on('error', (err, stdout, stderr) => {
        logger.error('FFmpeg stdout:', stdout);
        logger.error('FFmpeg stderr:', stderr);
        reject(new Error(`FFmpeg error: ${err.message}`));
      });
  });
};

const generateThumbnail = async (videoPath: string): Promise<string> => {
  const absoluteVideoPath = path.resolve(videoPath);
  const outputDir = path.dirname(absoluteVideoPath);
  const outputFilename = `thumb_${Date.now()}.jpg`;
  const thumbnailPath = path.join(outputDir, outputFilename);

  try {
    await takeScreenshot(absoluteVideoPath, outputDir, outputFilename);
    return thumbnailPath;
  } catch (error) {
    await cleanupDirectory(thumbnailPath);
    throw error;
  }
};

export { convertToHLS, takeScreenshot, generateThumbnail };
