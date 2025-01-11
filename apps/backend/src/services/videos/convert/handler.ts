import * as os from 'os';
import * as path from 'path';
import {
  generateTempDirName,
  downloadFile,
  createDirectory,
  cleanupDirectory,
  verifyFileSize,
} from '../helpers/file';
import { getDownloadUrl, uploadDirectory } from '../helpers/gcp-cloud-storage';
import { convertToHLS } from '../helpers/ffmpeg';
import { saveVideoSource } from 'src/database';
import { logger } from 'src/utils/logger';

export interface ConversionVideo {
  id: string;
  videoUrl: string;
  userId: string;
}

/**
 * Handles the core video conversion process, including file download, conversion, and upload
 *
 * @param data - Object containing video ID and source URL
 * @returns Promise resolving to the URL of the converted video's playlist
 * @throws Error if any step of the conversion process fails
 *
 * Process flow:
 * 1. Create temporary directories for processing
 * 2. Download source video
 * 3. Verify file size is within limits
 * 4. Convert video to HLS format
 * 5. Upload converted files to cloud storage
 * 6. Clean up temporary files
 */
const handleConvertVideo = async (data: ConversionVideo) => {
  const { id, videoUrl, userId } = data;
  const uniqueDir = generateTempDirName();
  const workingDir = path.join(os.tmpdir(), uniqueDir);
  const outputDir = path.join(workingDir, 'output');

  try {
    await createDirectory(workingDir);
    await createDirectory(outputDir);

    const inputPath = path.join(workingDir, 'input.mp4');
    await downloadFile(videoUrl, inputPath);
    await verifyFileSize(inputPath, 400 * 1024 * 1024); // 400MB limit

    const outputPath = path
      .join('videos', userId, id)
      .split(path.sep)
      .filter(Boolean)
      .join('/');

    await convertToHLS(inputPath, outputDir);

    logger.info(
      `[/videos/convert] converted "${id}" to HLS, uploading to Cloud Storage..`
    );

    await uploadDirectory(outputDir, outputPath);
    await cleanupDirectory(workingDir);

    return getDownloadUrl(`${outputPath}/playlist.m3u8`);
  } catch (error) {
    await cleanupDirectory(workingDir);
    if (error instanceof Error) {
      logger.error(error, `[/videos/convert] Video ${id} conversion error`);
      throw new Error(error.message);
    }
    logger.error(
      error,
      `[/videos/convert] Unknown error during video conversion "${id}"`
    );
    throw new Error('Unknown error during video conversion');
  }
};

/**
 * Updates the database with the converted video's source URL
 *
 * @param data - Object containing video ID and converted video URL
 * @returns Promise resolving to the updated video record
 * @throws Error if database update fails
 */
const postConvert = async (data: { id: string; videoUrl: string }) => {
  const { id, videoUrl } = data;
  const video = await saveVideoSource(id, videoUrl);

  return video;
};

/**
 * Main video conversion coordinator that manages the entire conversion workflow
 *
 * @param inputData - Object containing video ID and source URL
 * @returns Promise resolving to the updated video record
 * @throws Error from either conversion or database update process
 *
 * Process flow:
 * 1. Convert the video using handleConvertVideo
 * 2. Update the database with the new video URL using postConvert
 */
const convertVideo = async (inputData: ConversionVideo) => {
  let videoUrl;
  try {
    videoUrl = await handleConvertVideo(inputData);
  } catch (error) {
    throw new Error((error as unknown as Error).message);
  }

  logger.info(
    `[/videos/convert] "${inputData.id}" converted and uploaded, updating database...`
  );

  let video;
  try {
    video = await postConvert({
      ...inputData,
      videoUrl,
    });
  } catch (error) {
    throw new Error((error as unknown as Error).message);
  }

  logger.info(`[/videos/convert] "${inputData.id}" finished!`);

  return video;
};

export { handleConvertVideo, convertVideo };
