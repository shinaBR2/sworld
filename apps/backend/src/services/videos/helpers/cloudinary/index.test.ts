import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { uploadFromLocalFilePath } from '.';
import { existsSync } from 'fs';
import { envConfig } from 'src/utils/envConfig';

// Mock the cloudinary module
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(),
    },
  },
}));

// Mock fs.existsSync
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

// Mock the envConfig
vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    cloudinaryName: 'test-cloud',
    cloudinaryApiKey: 'test-api-key',
    cloudinaryApiSecret: 'test-secret',
  },
}));

describe('uploadFromLocalFilePath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to file existing
    vi.mocked(existsSync).mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should upload file successfully and return url', async () => {
    const localFilePath = '/path/to/file.mp4';
    const mockUploadResponse = { url: 'https://cloudinary.com/test-video.mp4' };
    vi.mocked(cloudinary.uploader.upload).mockResolvedValueOnce(
      mockUploadResponse as UploadApiResponse
    );

    const result = await uploadFromLocalFilePath(localFilePath);

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(localFilePath, {});
    expect(result).toBe(mockUploadResponse.url);
  });

  it('should pass additional options to upload', async () => {
    const localFilePath = '/path/to/file.mp4';
    const options = { folder: 'videos', resource_type: 'video' };
    const mockUploadResponse = { url: 'https://cloudinary.com/test-video.mp4' };
    vi.mocked(cloudinary.uploader.upload).mockResolvedValueOnce(
      mockUploadResponse as UploadApiResponse
    );

    const result = await uploadFromLocalFilePath(localFilePath, options);

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      localFilePath,
      options
    );
    expect(result).toBe(mockUploadResponse.url);
  });

  it('should throw error when file path is missing', async () => {
    const localFilePath = '';

    await expect(uploadFromLocalFilePath(localFilePath)).rejects.toThrow(
      'Invalid or missing file path'
    );
    expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
  });

  it('should throw error when file does not exist', async () => {
    const localFilePath = '/path/to/nonexistent.mp4';
    vi.mocked(existsSync).mockReturnValue(false);

    await expect(uploadFromLocalFilePath(localFilePath)).rejects.toThrow(
      'Invalid or missing file path'
    );
    expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
  });

  it('should throw error when upload fails', async () => {
    const localFilePath = '/path/to/file.mp4';
    const mockError = new Error('Upload failed');
    vi.mocked(cloudinary.uploader.upload).mockRejectedValueOnce(mockError);

    await expect(uploadFromLocalFilePath(localFilePath)).rejects.toThrow(
      mockError
    );
  });

  it('should throw error when upload returns no result', async () => {
    const localFilePath = '/path/to/file.mp4';
    vi.mocked(cloudinary.uploader.upload).mockResolvedValueOnce(
      undefined as unknown as UploadApiResponse
    );

    await expect(uploadFromLocalFilePath(localFilePath)).rejects.toThrow(
      'Upload failed: No result returned'
    );
  });
});
