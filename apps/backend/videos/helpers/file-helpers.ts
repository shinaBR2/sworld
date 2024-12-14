import { createWriteStream, unlink, readdir } from 'fs';
import { promisify } from 'util';
import * as path from 'path';
import * as crypto from 'crypto';

import { getStorage } from 'firebase-admin/storage';

// Helper to generate unique temporary directory names
const generateTempDirName = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Improved file download with stream handling and cleanup
const downloadFile = async (url: string, localPath: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  // Get content length if available
  const contentLength = response.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength);
    // Check if we have enough space (leaving some buffer)
    if (size > 400 * 1024 * 1024) {
      // 400MB limit
      throw new Error('File too large for temporary storage');
    }
  }

  return new Promise<void>((resolve, reject) => {
    const fileStream = createWriteStream(localPath);

    if (!response.body) {
      // unlink(localPath).catch(console.error);
      const unlinkAsync = promisify(unlink);
      unlinkAsync(localPath).catch(console.error);
      return reject(new Error('No response body'));
    }

    (async () => {
      try {
        const reader = response.body?.getReader();

        while (true) {
          //@ts-ignore
          const { done, value } = await reader?.read();
          if (done) break;

          // Write chunks to file stream
          fileStream.write(value);
        }

        fileStream.end();
        resolve();
      } catch (error) {
        const unlinkAsync = promisify(unlink);
        unlinkAsync(localPath).catch(console.error);
        // unlink(localPath).catch(console.error);
        reject(error);
      }
    })();

    fileStream.on('error', (error: any) => {
      // unlink(localPath).catch(console.error);
      const unlinkAsync = promisify(unlink);
      unlinkAsync(localPath).catch(console.error);
      reject(error);
    });
  });
};

// Improved Cloud Storage upload with chunking
const uploadToStorage = async (localPath: string, storagePath: string) => {
  const storage = getStorage();
  const bucket = storage.bucket();

  await bucket.upload(localPath, {
    destination: storagePath,
    resumable: true, // Enable resumable uploads for larger files
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });
};

// Improved directory upload with concurrency control
const uploadDirectory = async (localDir: string, storagePath: string) => {
  // const files = await readdir(localDir);
  const readdirAsync = promisify(readdir);
  const files = await readdirAsync(localDir);

  // Process files in batches to prevent memory issues
  const BATCH_SIZE = 3;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (file: string) => {
        const localFilePath = path.join(localDir, file);
        const storageFilePath = path.join(storagePath, file);
        await uploadToStorage(localFilePath, storageFilePath);
      })
    );
  }
};

const getDownloadUrl = (outputPath: string) => {
  const bucket = getStorage().bucket();
  return `https://storage.googleapis.com/${bucket.name}/${outputPath}/playlist.m3u8`;
};

export { generateTempDirName, downloadFile, uploadDirectory, getDownloadUrl };
