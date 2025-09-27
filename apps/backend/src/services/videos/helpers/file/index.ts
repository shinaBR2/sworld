import * as crypto from 'crypto';
import { createWriteStream, stat, unlink } from 'fs';
import { mkdir, rm } from 'fs/promises';
import * as os from 'os';
import path from 'path';
import { getCurrentLogger } from 'src/utils/logger';
import { promisify } from 'util';
import { videoConfig } from '../../config';

// Helper to generate unique temporary directory names
const generateTempDir = () => {
  const uniqueName = crypto.randomBytes(16).toString('hex');
  return path.join(os.tmpdir(), uniqueName);
};

/**
 * Downloads a file from a URL to a local path with error handling and size limits.
 * This method includes automatic cleanup of partially downloaded files on error.
 *
 * @param url - Remote URL to download from (e.g., 'https://example.com/video.mp4')
 * @param localPath - File path to save to. Can be absolute (e.g., '/tmp/workspace/video.mp4')
 *                   or relative to current working directory (e.g., 'workspace/video.mp4')
 * @throws {Error} If file is larger than max file size from config
 * @throws {Error} If network request fails
 * @throws {Error} If response body is missing
 * @throws {Error} If stream encounters an error
 */
const downloadFile = async (url: string, localPath: string) => {
  const logger = getCurrentLogger();
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  // Get content length if available
  const contentLength = response.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength);
    // Check if we have enough space (leaving some buffer)
    if (size > videoConfig.maxFileSize) {
      // 4GB limit
      throw new Error('File too large for temporary storage');
    }
  }

  return new Promise<void>((resolve, reject) => {
    const fileStream = createWriteStream(localPath);

    if (!response.body) {
      const unlinkAsync = promisify(unlink);
      unlinkAsync(localPath).catch(logger.error);
      return reject(new Error('No response body'));
    }

    (async () => {
      try {
        const reader = response.body?.getReader();

        while (true) {
          //@ts-expect-error
          const { done, value } = await reader?.read();
          if (done) break;

          // Write chunks to file stream
          fileStream.write(value);
        }

        fileStream.end();
        resolve();
      } catch (error) {
        const unlinkAsync = promisify(unlink);
        unlinkAsync(localPath).catch(logger.error);
        reject(error);
      }
    })();

    fileStream.on('error', (error: any) => {
      const unlinkAsync = promisify(unlink);
      unlinkAsync(localPath).catch(logger.error);
      reject(error);
    });
  });
};

const createDirectory = async (dirPath: string): Promise<void> => {
  await mkdir(dirPath, { recursive: true });
};

const cleanupDirectory = async (dirPath: string): Promise<void> => {
  const logger = getCurrentLogger();
  try {
    const statAsync = promisify(stat);
    const stats = await statAsync(dirPath);
    if (stats.isFile()) {
      // If it's a file
      const unlinkAsync = promisify(unlink);
      await unlinkAsync(dirPath);
    } else {
      // If it's a directory
      await rm(dirPath, { recursive: true, force: true });
    }
  } catch (error) {
    logger.error('Cleanup failed:', error);
  }
};

const verifyFileSize = async (
  filePath: string,
  maxSize: number,
): Promise<void> => {
  const statAsync = promisify(stat);
  const stats = await statAsync(filePath);
  if (stats.size > maxSize) {
    throw new Error('Downloaded file too large for processing');
  }
};

export {
  generateTempDir,
  downloadFile,
  createDirectory,
  cleanupDirectory,
  verifyFileSize,
};
