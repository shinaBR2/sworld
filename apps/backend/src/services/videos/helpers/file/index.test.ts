import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generateTempDir, downloadFile, createDirectory, cleanupDirectory, verifyFileSize } from '.';
import { createWriteStream, unlink, stat } from 'fs';
import { mkdir, rm } from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// Mock all filesystem-related modules
vi.mock('fs');
vi.mock('fs/promises');
vi.mock('firebase-admin/storage');
vi.mock('path');
vi.mock('crypto');
vi.mock('os');

describe('File Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTempDir', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(os.tmpdir).mockReturnValue('/temp');
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    });

    it('should generate temp directory path with random name', () => {
      const mockHex = 'mock123';
      vi.mocked(crypto.randomBytes).mockImplementation(
        () =>
          ({
            toString: () => mockHex,
          }) as unknown as Buffer
      );

      const result = generateTempDir();

      expect(crypto.randomBytes).toHaveBeenCalledWith(16);
      expect(path.join).toHaveBeenCalledWith('/temp', mockHex);
      expect(result).toBe('/temp/mock123');
    });

    it('should generate unique paths each time', () => {
      vi.mocked(crypto.randomBytes)
        .mockImplementationOnce(
          () =>
            ({
              toString: () => 'aaa',
            }) as unknown as Buffer
        )
        .mockImplementationOnce(
          () =>
            ({
              toString: () => 'bbb',
            }) as unknown as Buffer
        );

      const path1 = generateTempDir();
      const path2 = generateTempDir();

      expect(path1).not.toBe(path2);
    });

    it('should handle os.tmpdir() failure', () => {
      vi.mocked(os.tmpdir).mockImplementation(() => {
        throw new Error('Cannot access temp directory');
      });

      expect(() => generateTempDir()).toThrow('Cannot access temp directory');
    });

    it('should generate hex string of correct length', () => {
      vi.mocked(crypto.randomBytes).mockImplementation(() => {
        return Buffer.from('a'.repeat(16));
      });
      vi.mocked(path.basename).mockImplementation(p => p.split('/').pop() || '');

      const result = generateTempDir();
      const dirName = path.basename(result);
      expect(dirName.length).toBe(32);
    });

    it('should use existing temporary directory', () => {
      vi.mocked(os.tmpdir).mockReturnValue('/existing/temp/dir');
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      const result = generateTempDir();
      expect(result.startsWith('/existing/temp/dir/')).toBe(true);
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
        headers: new Headers({ 'content-length': '5000000000' }),
      });

      await expect(downloadFile(mockUrl, mockPath)).rejects.toThrow('File too large');
    });

    it('handles failed fetch', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(downloadFile(mockUrl, mockPath)).rejects.toThrow('Failed to fetch');
    });

    it('handles missing response body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-length': '1000' }),
        body: null,
      });

      await expect(downloadFile(mockUrl, mockPath)).rejects.toThrow('No response body');
      expect(unlink).toHaveBeenCalled();
    });

    it('handles stream error', async () => {
      const mockError = new Error('Stream error');
      mockWriteStream.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(mockError);
        }
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-length': '1000' }),
        body: {
          getReader: () => ({
            read: vi.fn().mockRejectedValue(mockError),
          }),
        },
      });

      await expect(downloadFile(mockUrl, mockPath)).rejects.toThrow(mockError);
      expect(unlink).toHaveBeenCalled();
    });
  });

  describe('createDirectory', () => {
    it('creates directory successfully', async () => {
      vi.mocked(mkdir).mockResolvedValue(undefined);

      await createDirectory('/test/dir');

      expect(mkdir).toHaveBeenCalledWith('/test/dir', { recursive: true });
    });

    it('handles directory creation error', async () => {
      const error = new Error('Permission denied');
      vi.mocked(mkdir).mockRejectedValue(error);

      await expect(createDirectory('/test/dir')).rejects.toThrow(error);
    });
  });

  describe('cleanupDirectory', () => {
    beforeEach(() => {
      vi.mocked(stat).mockImplementation((_, callback) => callback(null, { isFile: () => false }));
      vi.mocked(unlink).mockImplementation((_, callback) => callback(null));
    });

    it('removes directory successfully', async () => {
      vi.mocked(stat).mockImplementation((_, callback) => callback(null, { isFile: () => false }));
      vi.mocked(rm).mockResolvedValue(undefined);

      await cleanupDirectory('/test/dir');

      expect(rm).toHaveBeenCalledWith('/test/dir', {
        recursive: true,
        force: true,
      });
    });

    it('removes file successfully', async () => {
      vi.mocked(stat).mockImplementation((_, callback) => callback(null, { isFile: () => true }));

      await cleanupDirectory('/test/file.mp4');

      expect(unlink).toHaveBeenCalled();
    });

    it('handles cleanup error gracefully', async () => {
      const error = new Error('Cleanup failed');
      vi.mocked(rm).mockRejectedValue(error);

      await cleanupDirectory('/test/dir');
    });

    it('handles stat error gracefully', async () => {
      const error = new Error('Stat failed');
      vi.mocked(stat).mockImplementation((_, callback) => callback(error));

      await cleanupDirectory('/test/dir');
    });
  });

  describe('verifyFileSize', () => {
    it('accepts file within size limit', async () => {
      vi.mocked(stat).mockImplementation((_, callback) => callback(null, { size: 1000 } as any));

      await expect(verifyFileSize('/test/file.mp4', 2000)).resolves.not.toThrow();
    });

    it('rejects file exceeding size limit', async () => {
      vi.mocked(stat).mockImplementation((_, callback) => callback(null, { size: 3000 } as any));

      await expect(verifyFileSize('/test/file.mp4', 2000)).rejects.toThrow('Downloaded file too large for processing');
    });

    it('handles stat error', async () => {
      const error = new Error('File not found');
      vi.mocked(stat).mockImplementation((_, callback) => callback(error, null as any));

      await expect(verifyFileSize('/test/file.mp4', 2000)).rejects.toThrow(error);
    });
  });
});
