/** biome-ignore-all lint/complexity/useArrowFunction: it breaks the test */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDownloadUrl,
  uploadFile,
  DEFAULT_UPLOAD_OPTIONS,
  streamFile,
  uploadFolderParallel,
} from '.';
import { existsSync } from 'fs';
import { PassThrough, Readable } from 'node:stream';

interface MockReadable extends NodeJS.ReadableStream {
  on: (event: string, handler: (...args: any[]) => void) => MockReadable;
  pipe: (dest: NodeJS.WritableStream) => MockReadable;
  emit: (event: string | symbol, ...args: any[]) => boolean;
}

const mockReadable: MockReadable = {
  readable: true,
  read: vi.fn(),
  setEncoding: vi.fn().mockReturnThis(),
  pause: vi.fn().mockReturnThis(),
  resume: vi.fn().mockReturnThis(),
  isPaused: vi.fn().mockReturnValue(false),
  pipe: vi.fn().mockImplementation(function (
    this: MockReadable,
    dest: NodeJS.WritableStream,
  ) {
    this.dest = dest;
    setTimeout(() => dest.emit('finish'), 0);
    return this;
  }),
  unpipe: vi.fn().mockReturnThis(),
  unshift: vi.fn(),
  wrap: vi.fn(),
  [Symbol.asyncIterator]: vi.fn(),

  // Event emitter methods
  on: vi.fn().mockImplementation(function (
    this: any,
    event: string,
    listener: (...args: any[]) => void,
  ) {
    this.listeners = this.listeners || {};
    this.listeners[event] = listener;
    return this;
  }),
  once: vi.fn(),
  emit: vi.fn().mockImplementation(function (
    this: any,
    event: string | symbol,
    ...args: any[]
  ) {
    if (this.listeners && this.listeners[event as string]) {
      this.listeners[event as string](...args);
    }
    return true;
  }),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  off: vi.fn(),
  removeAllListeners: vi.fn(),
  setMaxListeners: vi.fn(),
  getMaxListeners: vi.fn(),
  listeners: vi.fn(),
  rawListeners: vi.fn(),
  listenerCount: vi.fn(),
  eventNames: vi.fn(),
  prependListener: vi.fn(),
  prependOnceListener: vi.fn(),
};

vi.spyOn(Readable, 'from').mockImplementation(
  () => mockReadable as unknown as Readable,
);

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  level: 'info',
  fatal: vi.fn(),
  trace: vi.fn(),
  silent: vi.fn(),
};

vi.mock('src/utils/logger', () => ({
  getCurrentLogger: vi.fn(() => mockLogger),
}));

// Create mock functions
const uploadMock = vi.fn().mockResolvedValue([{}]);
const bucketMock = vi.fn();
const storageMock = vi.fn();
const mockTransferManager = {
  uploadManyFiles: vi.fn().mockResolvedValue(undefined),
};
const mockFile = {
  delete: vi.fn(),
  createWriteStream: vi.fn(() => {
    const writeStream = new PassThrough();
    const originalOn = writeStream.on.bind(writeStream);
    writeStream.on = vi.fn((event, handler) => {
      originalOn(event, handler);
      return writeStream; // Return for chaining
    });
    return writeStream;
  }),
};

vi.mock('@google-cloud/storage', () => {
  return {
    Storage: function () {
      storageMock();
      return {
        bucket: function (name: string) {
          bucketMock(name);
          return {
            name: 'test-bucket',
            upload: uploadMock,
            file: vi.fn(() => mockFile),
          };
        },
      };
    },
    TransferManager: function () {
      return mockTransferManager;
    },
  };
});

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
      expect(storageMock).toHaveBeenCalled();
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
        uploadFile('/tmp/test.mp4', 'videos/test.mp4'),
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('uploadFolderParallel', () => {
    it('should upload files with correct destination paths', async () => {
      const localDir = '/local/path';
      const storagePath = 'remote/path';

      await uploadFolderParallel(localDir, storagePath);

      expect(mockTransferManager.uploadManyFiles).toHaveBeenCalledWith(
        localDir,
        expect.objectContaining({
          customDestinationBuilder: expect.any(Function),
        }),
      );

      // Test the destination builder
      const { customDestinationBuilder } =
        mockTransferManager.uploadManyFiles.mock.calls[0][1];
      const testFilePath = '/local/path/subfolder/file.txt';
      const destinationPath = customDestinationBuilder(testFilePath);
      expect(destinationPath).toBe('remote/path/subfolder/file.txt');
    });

    it('should handle empty folders', async () => {
      mockTransferManager.uploadManyFiles.mockResolvedValueOnce([]);
      await uploadFolderParallel('/empty/dir', 'remote/path');
      expect(mockTransferManager.uploadManyFiles).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      mockTransferManager.uploadManyFiles.mockRejectedValueOnce(
        new Error('Upload failed'),
      );
      await expect(
        uploadFolderParallel('/local/path', 'remote/path'),
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('streamFile', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    const testParams = {
      stream: mockReadable,
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
        'Network connection lost',
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
        'Upload timed out after 100ms',
      );

      // Clean up
      vi.useRealTimers();
    });

    it('should validate input parameters', async () => {
      await expect(
        streamFile({
          ...testParams,
          stream: null as any,
        }),
      ).rejects.toThrow('Invalid input stream');
    });

    it('should validate input parameters', async () => {
      await expect(
        streamFile({
          ...testParams,
          storagePath: '',
        }),
      ).rejects.toThrow('Storage path is required');
    });

    it('should validate input parameters', async () => {
      await expect(
        streamFile({
          ...testParams,
          options: null as any,
        }),
      ).rejects.toThrow('Write stream options are required');
    });

    it('should reject when invalid stream is provided', async () => {
      const params = {
        ...testParams,
        stream: { notAStream: true },
      };

      // @ts-expect-error
      await expect(streamFile(params)).rejects.toThrow(
        'Invalid stream provided',
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
        'Write stream error',
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

    it('should handle successful upload', async () => {
      await expect(streamFile(testParams)).resolves.toBeUndefined();
    });

    it('should handle non-Error pipe errors', async () => {
      const mockReadable = {
        pipe: vi.fn(() => {
          throw 'string error';
        }),
        on: vi.fn(),
      };

      const params = {
        ...testParams,
        stream: mockReadable as any,
      };

      await expect(streamFile(params)).rejects.toThrow(
        'Stream piping error: string error',
      );
    });
  });
});
