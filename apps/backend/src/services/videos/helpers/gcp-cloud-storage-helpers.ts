import { getStorage } from "firebase-admin/storage";
import { readdir } from "fs/promises";
import path from "path";

interface UploadOptions {
  cacheControl?: string;
  resumable?: boolean;
  batchSize?: number;
}

const DEFAULT_OPTIONS: UploadOptions = {
  cacheControl: "public, max-age=31536000",
  resumable: true,
  batchSize: 3,
};

const getDownloadUrl = (outputPath: string) => {
  const bucket = getStorage().bucket();
  return `https://storage.googleapis.com/${bucket.name}/${outputPath}/playlist.m3u8`;
};

// Improved Cloud Storage upload with chunking
const uploadFile = async (
  localPath: string,
  storagePath: string,
  options: UploadOptions = DEFAULT_OPTIONS
) => {
  const storage = getStorage();
  const bucket = storage.bucket();

  await bucket.upload(localPath, {
    destination: storagePath,
    resumable: options.resumable,
    metadata: {
      cacheControl: options.cacheControl,
    },
  });
};

// Improved directory upload with concurrency control
const uploadDirectory = async (
  localDir: string,
  storagePath: string,
  options: UploadOptions = DEFAULT_OPTIONS
) => {
  const files = await readdir(localDir);
  const batchSize = (options.batchSize || DEFAULT_OPTIONS.batchSize) as number;

  // Process files in batches to prevent memory issues
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (file: string) => {
        const localFilePath = path.join(localDir, file);
        const storageFilePath = path.join(storagePath, file);
        await uploadFile(localFilePath, storageFilePath, options);
      })
    );
  }
};

export { getDownloadUrl, uploadFile, uploadDirectory };
