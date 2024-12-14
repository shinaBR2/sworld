import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  generateTempDirName,
  downloadFile,
  uploadDirectory,
  getDownloadUrl,
} from './file-helpers';
import { createWriteStream, unlink, readdir } from 'fs';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';

vi.mock('fs');
vi.mock('firebase-admin/storage');

describe('File Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTempDirName', () => {
    it('generates 32-char hex string', () => {
      const result = generateTempDirName();
      expect(result).toMatch(/^[0-9a-f]{32}$/);
    });

    it('generates unique values', () => {
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(generateTempDirName());
      }
      expect(results.size).toBe(10);
    });
  });

  describe('downloadFile', () => {
    const mockUrl = 'https://example.com/file.mp4';
    const mockPath = '/tmp/file.mp4';
    let mockWriteStream: any;

    beforeEach(() => {
      mockWriteStream = {
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn(),
      };
      vi.mocked(createWriteStream).mockReturnValue(mockWriteStream);
      vi.mocked(unlink).mockImplementation((_, callback) => callback(null));
    });

    it('downloads file successfully', async () => {
      const mockBody = {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: Buffer.from('chunk1'),
            })
            .mockResolvedValueOnce({
              done: false,
              value: Buffer.from('chunk2'),
            })
            .mockResolvedValueOnce({ done: true }),
        }),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-length': '1000' }),
        body: mockBody,
      });

      await downloadFile(mockUrl, mockPath);

      expect(mockWriteStream.write).toHaveBeenCalledTimes(2);
      expect(mockWriteStream.end).toHaveBeenCalled();
    });

    it('rejects large files', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-length': '500000000' }),
      });

      await expect(downloadFile(mockUrl, mockPath)).rejects.toThrow(
        'File too large'
      );
    });

    it('handles failed fetch', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(downloadFile(mockUrl, mockPath)).rejects.toThrow(
        'Failed to fetch'
      );
    });
  });

  describe('uploadDirectory', () => {
    const mockLocalDir = '/tmp/videos';
    const mockStoragePath = 'videos/';
    const mockFiles = ['file1.mp4', 'file2.mp4'];
    let mockBucket: any;

    beforeEach(() => {
      mockBucket = {
        upload: vi.fn().mockResolvedValue([{}]),
      };
      // @ts-ignore
      vi.mocked(getStorage).mockReturnValue({
        bucket: () => mockBucket,
      });
      vi.mocked(readdir).mockImplementation((_, callback) =>
        // @ts-ignore
        callback(null, mockFiles)
      );
    });

    it('uploads files in batches', async () => {
      await uploadDirectory(mockLocalDir, mockStoragePath);

      expect(mockBucket.upload).toHaveBeenCalledTimes(mockFiles.length);
      mockFiles.forEach(file => {
        expect(mockBucket.upload).toHaveBeenCalledWith(
          path.join(mockLocalDir, file),
          expect.objectContaining({
            destination: path.join(mockStoragePath, file),
          })
        );
      });
    });

    it('handles empty directory', async () => {
      vi.mocked(readdir).mockImplementation((_, callback) =>
        // @ts-ignore
        callback(null, [])
      );
      await uploadDirectory(mockLocalDir, mockStoragePath);
      expect(mockBucket.upload).not.toHaveBeenCalled();
    });
  });

  describe('getDownloadUrl', () => {
    beforeEach(() => {
      vi.mocked(getStorage).mockReturnValue({
        // @ts-ignore
        bucket: () => ({ name: 'test-bucket' }),
      });
    });

    it('generates correct url format', () => {
      expect(getDownloadUrl('videos/123')).toBe(
        'https://storage.googleapis.com/test-bucket/videos/123/playlist.m3u8'
      );
    });
  });
});
