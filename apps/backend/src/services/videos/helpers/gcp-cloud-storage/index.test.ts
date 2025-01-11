// src/services/videos/helpers/__tests__/gcp-cloud-storage-helpers.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readdir } from 'fs/promises';
import path from 'path';
import {
  getDownloadUrl,
  uploadFile,
  uploadDirectory,
  DEFAULT_UPLOAD_OPTIONS,
} from '.';
import { existsSync } from 'fs';

// Create mock functions
const uploadMock = vi.fn().mockResolvedValue([{}]);
const bucketMock = vi.fn(() => ({
  name: 'test-bucket',
  upload: uploadMock,
}));

// Mock firebase-admin/storage
vi.mock('firebase-admin/storage', () => ({
  getStorage: vi.fn(() => ({
    bucket: bucketMock,
  })),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
}));

describe('gcp-cloud-storage-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(true);
  });

  describe('getDownloadUrl', () => {
    it('should return correct download URL', () => {
      const outputPath = 'videos/test-123/playlist.m3u8';
      const expected =
        'https://storage.googleapis.com/test-bucket/videos/test-123/playlist.m3u8';

      expect(getDownloadUrl(outputPath)).toBe(expected);
      expect(bucketMock).toHaveBeenCalled();
    });
  });

  describe('uploadFile', () => {
    it('should upload file with default options', async () => {
      const localPath = '/tmp/test.mp4';
      const storagePath = 'videos/test.mp4';

      await uploadFile(localPath, storagePath);

      expect(uploadMock).toHaveBeenCalledWith(localPath, {
        destination: storagePath,
        resumable: DEFAULT_UPLOAD_OPTIONS.resumable,
        metadata: {
          cacheControl: DEFAULT_UPLOAD_OPTIONS.cacheControl,
        },
      });
    });

    it('should upload file with custom options', async () => {
      const localPath = '/tmp/test.mp4';
      const storagePath = 'videos/test.mp4';
      const options = {
        cacheControl: 'private, max-age=3600',
        resumable: false,
      };

      await uploadFile(localPath, storagePath, options);

      expect(uploadMock).toHaveBeenCalledWith(localPath, {
        destination: storagePath,
        resumable: false,
        metadata: {
          cacheControl: 'private, max-age=3600',
        },
      });
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      uploadMock.mockRejectedValueOnce(error);

      await expect(
        uploadFile('/tmp/test.mp4', 'videos/test.mp4')
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('uploadDirectory', () => {
    it('should upload files in batches', async () => {
      const localDir = '/tmp/videos';
      const storagePath = 'videos/test';
      const files = ['1.ts', '2.ts', '3.ts', '4.ts', '5.ts'];

      vi.mocked(readdir).mockResolvedValue(files as any);
      // Use uploadMock directly since it's already set up as a mock function
      uploadMock.mockResolvedValue(undefined);

      await uploadDirectory(localDir, storagePath);

      expect(readdir).toHaveBeenCalledWith(localDir);
      expect(uploadMock).toHaveBeenCalledTimes(5);

      // Verify first file upload
      expect(uploadMock).toHaveBeenCalledWith(path.join(localDir, '1.ts'), {
        destination: path.join(storagePath, '1.ts'),
        resumable: DEFAULT_UPLOAD_OPTIONS.resumable,
        metadata: {
          cacheControl: DEFAULT_UPLOAD_OPTIONS.cacheControl,
        },
      });
    });

    it('should handle empty directory', async () => {
      vi.mocked(readdir).mockResolvedValue([]);

      await uploadDirectory('/tmp/videos', 'videos/test');

      expect(readdir).toHaveBeenCalled();
      expect(uploadMock).not.toHaveBeenCalled();
    });

    it('should use custom batch size', async () => {
      const localDir = '/tmp/videos';
      const storagePath = 'videos/test';
      const files = ['1.ts', '2.ts', '3.ts', '4.ts'];
      const customOptions = {
        ...DEFAULT_UPLOAD_OPTIONS,
        batchSize: 2,
      };

      vi.mocked(readdir).mockResolvedValue(files as any);
      uploadMock.mockResolvedValue(undefined);

      await uploadDirectory(localDir, storagePath, customOptions);

      expect(uploadMock).toHaveBeenCalledTimes(4);
      // Verify correct options are passed
      expect(uploadMock).toHaveBeenCalledWith(path.join(localDir, '1.ts'), {
        destination: path.join(storagePath, '1.ts'),
        resumable: DEFAULT_UPLOAD_OPTIONS.resumable,
        metadata: {
          cacheControl: DEFAULT_UPLOAD_OPTIONS.cacheControl,
        },
      });
    });

    it('should handle file upload errors', async () => {
      const localDir = '/tmp/videos';
      const storagePath = 'videos/test';
      const files = ['1.ts', '2.ts'];

      vi.mocked(readdir).mockResolvedValue(files as any);
      uploadMock.mockRejectedValue(new Error('Upload failed'));

      await expect(uploadDirectory(localDir, storagePath)).rejects.toThrow(
        'Upload failed'
      );
    });
  });
});
