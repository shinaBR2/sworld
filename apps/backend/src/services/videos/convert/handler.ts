import * as path from 'path';
import {
  generateTempDir,
  downloadFile,
  createDirectory,
  cleanupDirectory,
  verifyFileSize,
} from '../helpers/file';
import { getDownloadUrl, uploadDirectory } from '../helpers/gcp-cloud-storage';
import { convertToHLS, takeScreenshot } from '../helpers/ffmpeg';
import { finalizeVideo } from 'src/database';
import { logger } from 'src/utils/logger';
import { uploadFromLocalFilePath } from '../helpers/cloudinary';
import { existsSync, statSync } from 'fs';

export interface ConversionVideo {
  id: string;
  videoUrl: string;
  userId: string;
}

/**
 * Handles the complete video conversion process from source URL to HLS format
 * including downloading, converting, generating thumbnail, and uploading to cloud storage
 *
 * @param data Object containing video ID, source URL, and user ID
 * @returns Promise resolving to the updated video record
 * @throws Error if any step in the conversion process fails
 */
export const convertVideo = async (data: ConversionVideo) => {
  const { id, videoUrl, userId } = data;
  const workingDir = generateTempDir();
  const outputDir = path.join(workingDir, 'output');
  const thumbnailFilename = `${id}--${Date.now()}.jpg`;
  const thumbnailPath = path.join(workingDir, thumbnailFilename);
  const inputPath = path.join(workingDir, 'input.mp4');

  try {
    // Step 1: Create temporary working directories
    await createDirectory(workingDir);
    await createDirectory(outputDir);
    logger.debug(`Created working directories: ${workingDir}, ${outputDir}`);

    // Step 2: Download and verify source video
    await downloadFile(videoUrl, inputPath);
    await verifyFileSize(inputPath, 400 * 1024 * 1024); // 400MB limit
    logger.debug(`Downloaded and verified source video: ${inputPath}`);

    // Step 3: Convert video to HLS format
    await convertToHLS(inputPath, outputDir);

    // Verify input file still exists and check its size after conversion
    if (!existsSync(inputPath)) {
      throw new Error('Input file missing after HLS conversion');
    }
    const stats = statSync(inputPath);
    logger.debug(
      `HLS conversion complete. Input file size: ${stats.size} bytes`
    );

    // Step 4: Generate and upload thumbnail
    await takeScreenshot(inputPath, workingDir, thumbnailFilename);
    if (!existsSync(thumbnailPath)) {
      throw new Error('Screenshot file not created');
    }
    const thumbnailUrl = await uploadFromLocalFilePath(thumbnailPath, {
      asset_folder: userId,
    });
    logger.debug(`Generated and uploaded thumbnail: ${thumbnailUrl}`);

    // Step 5: Upload converted video files to cloud storage
    const outputPath = path
      .join('videos', userId, id)
      .split(path.sep)
      .filter(Boolean)
      .join('/');

    await uploadDirectory(outputDir, outputPath);
    const playlistUrl = getDownloadUrl(`${outputPath}/playlist.m3u8`);
    logger.debug(`Uploaded converted files to cloud storage: ${playlistUrl}`);

    // Step 6: Update database with new video information
    const video = await finalizeVideo({
      id,
      source: playlistUrl,
      thumbnailUrl,
    });
    return video;
  } catch (error) {
    logger.error(error, `Video conversion failed for ID ${id}`);
    throw new Error(`Video conversion failed: ${(error as Error).message}`);
  } finally {
    try {
      await cleanupDirectory(workingDir);
      logger.debug(`Cleaned up working directory: ${workingDir}`);
    } catch (cleanupError) {
      logger.error(
        cleanupError,
        `Failed to clean up working directory: ${workingDir}`
      );
    }
  }
};
