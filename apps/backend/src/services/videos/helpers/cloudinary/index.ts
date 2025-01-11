import { v2 as cloudinary } from 'cloudinary';
import { existsSync } from 'fs';
import { envConfig } from 'src/utils/envConfig';
import { logger } from 'src/utils/logger';

cloudinary.config({
  cloud_name: envConfig.cloudinaryName,
  api_key: envConfig.cloudinaryApiKey,
  api_secret: envConfig.cloudinaryApiSecret,
});

const uploadFromLocalFilePath = async (localFilePath: string, options = {}) => {
  if (!localFilePath || !existsSync(localFilePath)) {
    throw new Error('Invalid or missing file path');
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      ...options,
    });

    if (uploadResult) {
      return uploadResult.url;
    }

    throw new Error('Upload failed: No result returned');
  } catch (error) {
    logger.error('Cloudinary upload failed:', error);
    throw error;
  }
};

export { uploadFromLocalFilePath };
