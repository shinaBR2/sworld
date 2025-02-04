import { Storage, TransferManager, CreateWriteStreamOptions } from '@google-cloud/storage';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import { envConfig } from 'src/utils/envConfig';
import { logger } from 'src/utils/logger';
import { systemConfig } from 'src/utils/systemConfig';

interface UploadOptions {
  cacheControl?: string;
  resumable?: boolean;
  batchSize?: number;
}

const DEFAULT_UPLOAD_OPTIONS: UploadOptions = {
  cacheControl: 'public, max-age=31536000',
  resumable: true,
  batchSize: 3,
};

let storageInstance: Storage | null = null;

const getDefaultBucket = () => {
  if (!storageInstance) {
    storageInstance = new Storage();
  }
  const bucket = storageInstance.bucket(envConfig.storageBucket as string);

  return bucket;
};

/**
 * Generate public download URL for HLS playlist from GCP Cloud Storage
 * outputPath - Relative path in storage bucket, should NOT start with '/' (e.g., 'videos/123')
 * @returns Full public URL to the file
 */
const getDownloadUrl = (outputPath: string) => {
  const bucket = getDefaultBucket();
  return `https://storage.googleapis.com/${bucket.name}/${outputPath}`;
};

/**
 * Upload a single file to GCP Cloud Storage
 * @param localPath - Local file path. If relative, it's relative to current working directory
 * @param storagePath - Destination path in storage bucket, must be relative path (e.g., 'videos/123/file.mp4')
 * @param options - Upload options for caching and resumable uploads
 */
const uploadFile = async (localPath: string, storagePath: string, options: UploadOptions = DEFAULT_UPLOAD_OPTIONS) => {
  const bucket = getDefaultBucket();

  await bucket.upload(localPath, {
    destination: storagePath,
    resumable: options.resumable,
    metadata: {
      cacheControl: options.cacheControl,
    },
  });
};

/**
 * Upload all files from a local directory to GCP Cloud Storage.
 * Processes files in batches to prevent memory issues.
 *
 * @param localDir - Local directory path. If relative, it's relative to current working directory
 * @param storagePath - Base destination path in storage bucket (e.g., 'videos/123').
 *                      Must be a relative path, should NOT start with '/'
 * @param options - Upload options including batch size for concurrent uploads
 *
 * Example:
 * Local directory: /tmp/videos/123/ or ./videos/123/
 * Files: [1.ts, 2.ts, playlist.m3u8]
 * storagePath: 'videos/abc' (NOT '/videos/abc')
 * Result in GCS:
 * - videos/abc/1.ts
 * - videos/abc/2.ts
 * - videos/abc/playlist.m3u8
 *
 * Note: Google Cloud Storage doesn't use absolute paths - all paths are relative
 * to the bucket root. Any leading slashes will be removed.
 */
const uploadDirectory = async (
  localDir: string,
  storagePath: string,
  options: UploadOptions = DEFAULT_UPLOAD_OPTIONS
) => {
  if (!existsSync(localDir)) {
    throw new Error('Local directory does not exist');
  }

  const files = await readdir(localDir);
  const batchSize = (options.batchSize || DEFAULT_UPLOAD_OPTIONS.batchSize) as number;

  // Process files in batches to prevent memory issues
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (file: string) => {
        const localFilePath = path.join(localDir, file);
        const storageFilePath = path.join(storagePath, file);
        try {
          await uploadFile(localFilePath, storageFilePath, options);
        } catch (error) {
          logger.error(`Failed to upload ${file}:`, error);
          throw error;
        }
      })
    );
  }
};

const uploadFolderParallel = async (localDir: string, storagePath: string) => {
  const bucket = getDefaultBucket();
  const transferManager = new TransferManager(bucket);

  await transferManager.uploadManyFiles(localDir, {
    customDestinationBuilder: filePath => {
      const fileName = path.relative(localDir, filePath);
      return path.join(storagePath, fileName);
    },
  });
};

interface StreamFileParams {
  /** The readable stream of the file content */
  stream: NodeJS.ReadableStream;
  /** Destination path in Cloud Storage (e.g., 'videos/123/segments/file.ts') */
  storagePath: string;
  /** Configuration options for the write stream (e.g., contentType, metadata) */
  options: CreateWriteStreamOptions;
}

/**
 * Streams a file to Cloud Storage
 * @param params Configuration object containing all parameters
 * @returns Promise that resolves when streaming is complete
 */
const streamFile = async (params: StreamFileParams) => {
  const { stream, storagePath, options } = params;

  if (!stream) {
    throw new Error('Invalid input stream');
  }

  if (typeof stream.pipe !== 'function' || typeof stream.on !== 'function') {
    throw new Error('Invalid stream provided');
  }

  if (!storagePath?.trim()) {
    throw new Error('Storage path is required');
  }
  if (!options) {
    throw new Error('Write stream options are required');
  }

  const bucket = getDefaultBucket();
  const file = bucket.file(storagePath);
  const writeStream = file.createWriteStream(options);
  const { timeout = systemConfig.defaultExternalRequestTimeout } = options;

  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;
    // Flag to track if we've already handled an error
    let errorHandled = false;

    // Helper function to handle errors and cleanup
    const handleError = async (errorMessage: string, originalError?: Error) => {
      if (errorHandled) return;
      errorHandled = true;
      clearTimeout(timeoutId);

      try {
        // Delete the partially uploaded file
        await file.delete();
      } catch (deleteError) {
        // Log deletion error, but don't override the original error
        logger.error(
          {
            storagePath,
            deleteError,
            originalError: originalError?.message,
          },
          'Failed to delete partial file after upload error'
        );
      }

      // Reject with a descriptive error
      reject(new Error(errorMessage, { cause: originalError }));
    };

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        const errorMessage = `Upload timed out after ${timeout}ms`;
        handleError(errorMessage, new Error(errorMessage));
      }, timeout);
    }

    // Handle stream read errors
    stream.on('error', readError => {
      handleError(`Stream read error: ${readError.message}`, readError);
    });

    // Handle write stream errors
    writeStream.on('error', writeError => {
      handleError(`Cloud storage write error: ${writeError.message}`, writeError);
    });

    // Successful completion
    writeStream.on('finish', () => {
      clearTimeout(timeoutId);
      resolve(undefined);
    });

    // Pipe the stream and handle potential immediate piping errors
    try {
      const piped = stream.pipe(writeStream);
      piped.on('error', reject).on('finish', resolve);
    } catch (pipeError) {
      handleError(
        `Stream piping error: ${pipeError instanceof Error ? pipeError.message : String(pipeError)}`,
        pipeError instanceof Error ? pipeError : undefined
      );
    }
  });
};

export { DEFAULT_UPLOAD_OPTIONS, getDownloadUrl, uploadFile, uploadDirectory, uploadFolderParallel, streamFile };
