// src/services/videos/helpers/__tests__/gcp-cloud-storage-helpers.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readdir } from 'fs/promises';
import path from 'path';
import {
  getDownloadUrl,
  uploadFile,
  uploadDirectory,
  DEFAULT_UPLOAD_OPTIONS,
  streamFile,
} from '.';
import { existsSync } from 'fs';
import { PassThrough, Readable } from 'node:stream';

const mockReadable = {
  on: vi.fn().mockReturnThis(),
  pipe: vi.fn().mockReturnThis(),
};
vi.spyOn(Readable, 'from').mockImplementation(() => mockReadable as any);

// Create mock functions
const uploadMock = vi.fn().mockResolvedValue([{}]);
const bucketMock = vi.fn(() => ({
  name: 'test-bucket',
  upload: uploadMock,
  file: vi.fn(() => ({
    createWriteStream: vi.fn(() => new PassThrough()),
  })),
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

vi.mock('node-fetch', () => {
  return {
    default: vi.fn(),
  };
});

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

  describe('streamFile', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    const testParams = {
      stream: Readable.from(['test']),
      storagePath: 'test-path',
      options: {
        contentType: 'test/type',
      },
    };

    it('should handle network interruption', async () => {
      mockReadable.on.mockImplementation((event, handler) => {
        if (event === 'error') {
          // Simulate network error
          handler(new Error('Network connection lost'));
        }
        return mockReadable;
      });

      await expect(streamFile(testParams)).rejects.toThrow(
        'Network connection lost'
      );
    });

    it('should handle network timeout', async () => {
      const params = {
        stream: new Readable({
          read() {}, // Never push any data
        }),
        storagePath: 'test-path',
        options: {
          contentType: 'test/type',
          timeout: 100, // Short timeout for testing
        },
      };

      // Use fake timers for reliable timeout testing
      vi.useFakeTimers();

      const uploadPromise = streamFile(params);

      // Advance timers to trigger timeout
      vi.advanceTimersByTime(100);

      await expect(uploadPromise).rejects.toThrow(
        'Upload timed out after 100ms'
      );

      // Clean up
      vi.useRealTimers();
    });

    it('should validate input parameters', async () => {
      await expect(
        streamFile({
          ...testParams,
          stream: null as any,
        })
      ).rejects.toThrow('Invalid input stream');
    });

    it('should validate input parameters', async () => {
      await expect(
        streamFile({
          ...testParams,
          storagePath: '',
        })
      ).rejects.toThrow('Storage path is required');
    });

    it('should validate input parameters', async () => {
      await expect(
        streamFile({
          ...testParams,
          options: null as any,
        })
      ).rejects.toThrow('Write stream options are required');
    });

    it('should reject when invalid stream is provided', async () => {
      const params = {
        ...testParams,
        stream: { notAStream: true },
      };

      // @ts-expect-error
      await expect(streamFile(params)).rejects.toThrow(
        'Invalid stream provided'
      );
    });

    it('should stream file to Cloud Storage', async () => {
      mockReadable.on.mockImplementation((event, handler) => {
        if (event === 'finish') {
          handler();
        }
        return mockReadable;
      });

      await expect(streamFile(testParams)).resolves.not.toThrow();
    });

    it('should reject when streaming fails', async () => {
      mockReadable.on.mockImplementation((event, handler) => {
        if (event === 'error') {
          handler(new Error('Upload failed'));
        }
        return mockReadable;
      });

      await expect(streamFile(testParams)).rejects.toThrow('Upload failed');
    });

    it('should handle read stream error', async () => {
      mockReadable.on.mockImplementation((event, handler) => {
        if (event === 'error') {
          handler(new Error('Read stream error'));
        }
        return mockReadable;
      });

      await expect(streamFile(testParams)).rejects.toThrow('Read stream error');
    });

    it('should handle write stream error', async () => {
      mockReadable.on.mockImplementation((event, handler) => {
        if (event === 'error') {
          handler(new Error('Write stream error'));
        }
        return mockReadable;
      });

      await expect(streamFile(testParams)).rejects.toThrow(
        'Write stream error'
      );
    });

    it('should successfully complete file upload', async () => {
      mockReadable.on.mockImplementation((event, handler) => {
        if (event === 'finish') {
          handler();
        }
        return mockReadable;
      });

      await expect(streamFile(testParams)).resolves.not.toThrow();
    });
  });
});
