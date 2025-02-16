import path from 'path';
import { createDirectory, downloadFile, generateTempDir } from '../file';
import { takeScreenshot } from '../ffmpeg';
import { uploadFile } from '../gcp-cloud-storage';

interface ProcessThumbnailProps {
  /** Remote url e.g 'https://cdn.com/video.mp4' */
  url: string;
  /** Duration of video in seconds */
  duration: number;
  /** Destination GCP Cloud Storage path e.g 'videos/video-123' */
  storagePath: string;
}

/**
 * Processes a video to generate a thumbnail and uploads it to Cloud Storage.
 * This function handles the entire pipeline:
 * 1. Creates a temporary workspace
 * 2. Downloads the source video
 * 3. Generates a thumbnail using FFmpeg
 * 4. Uploads the thumbnail to Cloud Storage
 *
 * The function cleans up temporary files through error handling in the helper functions.
 *
 * @param props - Configuration object for thumbnail processing
 * @returns The final Cloud Storage path of the generated thumbnail
 * @throws {Error} If any step in the pipeline fails (download, FFmpeg, upload)
 */
const processThumbnail = async (props: ProcessThumbnailProps) => {
  const { url, duration, storagePath } = props;
  const workingDir = generateTempDir();
  const thumbnailFilename = `thumbnail--${Date.now()}.jpg`;
  const localThumbnailPath = path.join(workingDir, thumbnailFilename);

  // FFmpeg can detect format without extension
  const inputPath = path.join(workingDir, 'input_video_file');

  await createDirectory(workingDir);

  // Download and verify source video
  await downloadFile(url, inputPath);

  // Take screenshot and save to working directory
  await takeScreenshot(inputPath, workingDir, thumbnailFilename, duration);

  // Upload to storage and construct final path
  const finalStoragePath = `${storagePath}/${thumbnailFilename}`;
  await uploadFile(localThumbnailPath, finalStoragePath);

  return finalStoragePath;
};

export { processThumbnail };
