import * as os from 'os';
// @ts-ignore
import ffmpeg from 'fluent-ffmpeg';
import { stat } from 'fs';
import { mkdir } from 'fs/promises';
import { rm } from 'fs/promises';
import { promisify } from 'util';
import path from 'path';
import {
  generateTempDirName,
  downloadFile,
  uploadDirectory,
  getDownloadUrl,
} from './file-helpers';

export interface ConversionVideo {
  id: string;
  videoUrl: string;
}

const cleanupWorkingDirectory = async (workingDir: string) => {
  try {
    // await fs.remove(workingDir);
    await rm(workingDir, { recursive: true, force: true });
  } catch (error) {
    // Log the error but don't throw it - cleanup failures shouldn't break the main flow
    console.error('Cleanup failed:', error);
  }
};

const handleConvertVideo = async (data: ConversionVideo) => {
  const { id, videoUrl } = data;

  // Generate unique working directory name
  const uniqueDir = generateTempDirName();
  const workingDir = path.join(os.tmpdir(), uniqueDir);
  const outputDir = path.join(workingDir, 'output');

  try {
    // await ensureDir(workingDir);
    await mkdir(workingDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });
    // await ensureDir(outputDir);

    const inputPath = path.join(workingDir, 'input.mp4');
    await downloadFile(videoUrl, inputPath);

    // Check file size after download
    // const stats = await stat(inputPath);
    const statAsync = promisify(stat);
    const stats = await statAsync(inputPath);
    if (stats.size > 400 * 1024 * 1024) {
      // 400MB
      throw new Error('Downloaded file too large for processing');
    }

    // Generate a clean storage path
    const outputPath = `videos/${id}`;
    const cleanOutputPath = path
      .normalize(outputPath)
      .replace(/^\/+|\/+$/g, '');

    // Convert to HLS
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-codec copy',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls',
        ])
        .output(path.join(outputDir, 'playlist.m3u8'))
        .on('end', () => resolve())
        .on('error', (err: any) => reject(err))
        .run();
    });

    await uploadDirectory(outputDir, cleanOutputPath);

    await cleanupWorkingDirectory(workingDir);

    const playlistUrl = getDownloadUrl(cleanOutputPath);

    return playlistUrl;
  } catch (error) {
    await cleanupWorkingDirectory(workingDir);

    if (error instanceof Error) {
      console.error('Video conversion error:', error);
      throw new Error(error.message);
    } else {
      console.error('Unknown error during video conversion:', error);
      throw new Error('Unknown error during video conversion');
    }
  }
};

export { handleConvertVideo };
