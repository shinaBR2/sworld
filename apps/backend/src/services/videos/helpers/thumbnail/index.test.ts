import { describe, it, expect, vi, beforeEach } from 'vitest';
import type path from 'path';
import { processThumbnail } from './';
import { createDirectory, downloadFile, generateTempDir } from '../file';
import { takeScreenshot } from '../ffmpeg';
import { uploadFile } from '../gcp-cloud-storage';

// Mock all dependencies
vi.mock('path', async () => {
  const actual = (await vi.importActual('path')) as typeof path;
  return {
    ...actual,
    join: vi.fn((...args) => args.join('/')),
  };
});

vi.mock('../file', () => ({
  createDirectory: vi.fn(),
  downloadFile: vi.fn(),
  generateTempDir: vi.fn(),
}));

vi.mock('../ffmpeg', () => ({
  takeScreenshot: vi.fn(),
}));

vi.mock('../gcp-cloud-storage', () => ({
  uploadFile: vi.fn(),
}));

describe('processThumbnail', () => {
  const mockProps = {
    url: 'https://example.com/video.mp4',
    duration: 30,
    storagePath: 'videos/test-123',
  };

  const mockWorkingDir = 'temp/123456';

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementations
    vi.mocked(generateTempDir).mockReturnValue(mockWorkingDir);
    vi.mocked(createDirectory).mockResolvedValue(undefined);
    vi.mocked(downloadFile).mockResolvedValue(undefined);
    vi.mocked(takeScreenshot).mockResolvedValue(undefined);
    vi.mocked(uploadFile).mockResolvedValue(undefined);
  });

  it('should process thumbnail successfully', async () => {
    const result = await processThumbnail(mockProps);

    // Verify working directory creation
    expect(generateTempDir).toHaveBeenCalled();
    expect(createDirectory).toHaveBeenCalledWith(mockWorkingDir);

    // Verify video download
    expect(downloadFile).toHaveBeenCalledWith(
      mockProps.url,
      'temp/123456/input_video_file',
    );

    // Verify screenshot generation
    expect(takeScreenshot).toHaveBeenCalledWith(
      'temp/123456/input_video_file',
      mockWorkingDir,
      expect.stringMatching(/^thumbnail--\d+\.jpg$/),
      mockProps.duration,
      false,
    );

    // Verify thumbnail upload
    expect(uploadFile).toHaveBeenCalledWith(
      expect.stringMatching(/^temp\/123456\/thumbnail--\d+\.jpg$/),
      expect.stringMatching(/^videos\/test-123\/thumbnail--\d+\.jpg$/),
    );

    // Verify returned storage path
    expect(result).toMatch(/^videos\/test-123\/thumbnail--\d+\.jpg$/);
  });

  it('should handle download failure', async () => {
    const error = new Error('Download failed');
    vi.mocked(downloadFile).mockRejectedValue(error);

    await expect(processThumbnail(mockProps)).rejects.toThrow(
      'Download failed',
    );
    expect(takeScreenshot).not.toHaveBeenCalled();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('should handle screenshot failure', async () => {
    const error = new Error('Screenshot failed');
    vi.mocked(takeScreenshot).mockRejectedValue(error);

    await expect(processThumbnail(mockProps)).rejects.toThrow(
      'Screenshot failed',
    );
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('should handle upload failure', async () => {
    const error = new Error('Upload failed');
    vi.mocked(uploadFile).mockRejectedValue(error);

    await expect(processThumbnail(mockProps)).rejects.toThrow('Upload failed');
  });

  it('should use correct timestamp format in filename', async () => {
    // Mock Date.now()
    const mockTimestamp = 1234567890;
    const realDateNow = Date.now;
    Date.now = vi.fn(() => mockTimestamp);

    await processThumbnail(mockProps);

    const expectedFilename = `thumbnail--${mockTimestamp}.jpg`;
    expect(uploadFile).toHaveBeenCalledWith(
      `temp/123456/${expectedFilename}`,
      `videos/test-123/${expectedFilename}`,
    );

    // Restore Date.now
    Date.now = realDateNow;
  });

  it('should handle segment thumbnail', async () => {
    const segmentProps = {
      ...mockProps,
      isSegment: true,
    };

    await processThumbnail(segmentProps);

    expect(takeScreenshot).toHaveBeenCalledWith(
      'temp/123456/input_video_file',
      mockWorkingDir,
      expect.stringMatching(/^thumbnail--\d+\.jpg$/),
      mockProps.duration,
      true,
    );
  });
});
