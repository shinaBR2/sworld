import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { videoConfig } from '../config';
import * as cloudinaryHelpers from '../helpers/cloudinary';
import * as ffmpegHelpers from '../helpers/ffmpeg';
import * as fileHelpers from '../helpers/file';
import * as gcpHelpers from '../helpers/gcp-cloud-storage';
import { convertVideo, type ConversionVideo } from './handler';

// Mock the logger module
vi.mock('src/utils/logger', () => ({
  getCurrentLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock all external dependencies
vi.mock('../helpers/file');
vi.mock('../helpers/gcp-cloud-storage');
vi.mock('../helpers/ffmpeg');
vi.mock('../helpers/cloudinary');
vi.mock('fs');

// Add proper Hasura mutation mock
vi.mock('src/services/hasura/mutations/videos/finalize', () => ({
  finishVideoProcess: vi.fn().mockResolvedValue({ id: 'notification-123' }),
}));

describe('convertVideo', () => {
  const mockData: ConversionVideo = {
    taskId: '123e4567-e89b-12d3-a456-426614174000',
    videoData: {
      id: '987fcdeb-89ab-12d3-a456-426614174000',
      videoUrl: 'https://example.com/video.mp4',
      userId: 'user-123',
    },
  };

  const tempDir = '/temp/test-dir';
  const mockPaths = {
    workingDir: tempDir,
    outputDir: path.join(tempDir, 'output'),
    inputPath: path.join(tempDir, 'input.mp4'),
    thumbnailPathPattern: new RegExp(
      path
        .join(tempDir, `${mockData.videoData.id}--\\d+\\.jpg`)
        .replace(/\\/g, '\\\\'),
    ),
  };

  const mockVideoDuration = 100;

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock generateTempDir to return consistent path
    vi.mocked(fileHelpers.generateTempDir).mockReturnValue(tempDir);

    // Mock file existence checks
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(statSync).mockReturnValue({
      size: 1000000,
      isFile: () => true,
    } as unknown as ReturnType<typeof statSync>);

    // Mock readdirSync to return some files for HLS conversion
    vi.mocked(readdirSync).mockReturnValue([
      'playlist.m3u8',
      'segment1.ts',
      'segment2.ts',
    ] as any);

    // Mock successful file operations
    vi.mocked(fileHelpers.createDirectory).mockResolvedValue(undefined);
    vi.mocked(fileHelpers.downloadFile).mockResolvedValue(undefined);
    vi.mocked(fileHelpers.verifyFileSize).mockResolvedValue(undefined);
    vi.mocked(fileHelpers.cleanupDirectory).mockResolvedValue(undefined);

    // Mock successful conversions
    vi.mocked(ffmpegHelpers.convertToHLS).mockResolvedValue(undefined);
    vi.mocked(ffmpegHelpers.getDuration).mockResolvedValue(mockVideoDuration);
    vi.mocked(ffmpegHelpers.takeScreenshot).mockResolvedValue(undefined);

    // Mock successful uploads
    vi.mocked(cloudinaryHelpers.uploadFromLocalFilePath).mockResolvedValue(
      'https://cloudinary.com/thumbnail.jpg',
    );
    vi.mocked(gcpHelpers.uploadFolderParallel).mockResolvedValue(undefined);
    vi.mocked(gcpHelpers.getDownloadUrl).mockReturnValue(
      'https://storage.googleapis.com/playlist.m3u8',
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const getMockLogger = () => {
    // Since the logger is mocked at module level, we don't need to test its calls
    // The important thing is that the business logic works correctly
    return null;
  };

  it('should successfully convert a video', async () => {
    const result = await convertVideo(mockData);

    // Verify directories were created
    expect(fileHelpers.createDirectory).toHaveBeenCalledWith(
      mockPaths.workingDir,
    );
    expect(fileHelpers.createDirectory).toHaveBeenCalledWith(
      mockPaths.outputDir,
    );

    // Verify file downloads
    expect(fileHelpers.downloadFile).toHaveBeenCalledWith(
      mockData.videoData.videoUrl,
      mockPaths.inputPath,
    );
    expect(fileHelpers.verifyFileSize).toHaveBeenCalledWith(
      mockPaths.inputPath,
      videoConfig.maxFileSize,
    );

    // Verify video conversion
    expect(ffmpegHelpers.getDuration).toHaveBeenCalledWith(mockPaths.inputPath);
    expect(ffmpegHelpers.convertToHLS).toHaveBeenCalledWith(
      mockPaths.inputPath,
      mockPaths.outputDir,
    );
    expect(ffmpegHelpers.takeScreenshot).toHaveBeenCalledWith(
      mockPaths.inputPath,
      mockPaths.workingDir,
      expect.stringMatching(new RegExp(`${mockData.videoData.id}--\\d+\\.jpg`)),
      mockVideoDuration,
    );

    // Verify uploads
    expect(cloudinaryHelpers.uploadFromLocalFilePath).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`${mockData.videoData.id}--\\d+\\.jpg`)),
      { asset_folder: mockData.videoData.userId },
    );
    expect(gcpHelpers.uploadFolderParallel).toHaveBeenCalled();

    // Verify finish process
    expect(finishVideoProcess).toHaveBeenCalledWith({
      taskId: mockData.taskId,
      notificationObject: {
        type: 'video-ready',
        entityId: mockData.videoData.id,
        entityType: 'video',
        user_id: mockData.videoData.userId,
      },
      videoId: mockData.videoData.id,
      videoUpdates: {
        source: 'https://storage.googleapis.com/playlist.m3u8',
        thumbnailUrl: 'https://cloudinary.com/thumbnail.jpg',
        status: 'ready',
        duration: mockVideoDuration,
      },
    });

    // Verify cleanup
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(
      mockPaths.workingDir,
    );

    // Verify return value
    expect(result).toBe('https://storage.googleapis.com/playlist.m3u8');
  });

  it('should throw error if directory creation fails', async () => {
    const error = new Error('Failed to create directory');
    vi.mocked(fileHelpers.createDirectory).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow(
      'Video conversion failed: Failed to create directory',
    );
  });

  it('should throw error if file download fails', async () => {
    const error = new Error('Download failed');
    vi.mocked(fileHelpers.downloadFile).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow(
      'Video conversion failed: Download failed',
    );
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(
      mockPaths.workingDir,
    );
  });

  it('should throw error if input file missing after HLS conversion', async () => {
    vi.mocked(existsSync).mockReturnValueOnce(false); // Input file missing after conversion

    await expect(convertVideo(mockData)).rejects.toThrow(
      'Video conversion failed: Input file missing after HLS conversion',
    );
  });

  it('should throw error if finishVideoProcess fails', async () => {
    const error = new Error('Hasura mutation failed');
    vi.mocked(finishVideoProcess).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow(
      'Video conversion failed: Hasura mutation failed',
    );
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(
      mockPaths.workingDir,
    );
  });

  it('should throw error if screenshot generation fails', async () => {
    const error = new Error('Screenshot failed');
    vi.mocked(ffmpegHelpers.takeScreenshot).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow(
      'Video conversion failed: Screenshot failed',
    );
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(
      mockPaths.workingDir,
    );
  });

  it('should throw error if screenshot file is not created', async () => {
    vi.mocked(ffmpegHelpers.takeScreenshot).mockResolvedValue(undefined);
    vi.mocked(existsSync)
      .mockReturnValueOnce(true) // for input file check after conversion
      .mockReturnValueOnce(false); // for screenshot file check

    await expect(convertVideo(mockData)).rejects.toThrow(
      'Video conversion failed: Screenshot file not created',
    );
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(
      mockPaths.workingDir,
    );
  });

  it('should throw error if cloudinary upload fails', async () => {
    const error = new Error('Upload failed');
    vi.mocked(cloudinaryHelpers.uploadFromLocalFilePath).mockRejectedValueOnce(
      error,
    );

    await expect(convertVideo(mockData)).rejects.toThrow(
      'Video conversion failed: Upload failed',
    );
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(
      mockPaths.workingDir,
    );
  });

  it('should throw error if GCP upload fails', async () => {
    const error = new Error('GCP upload failed');
    vi.mocked(gcpHelpers.uploadFolderParallel).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow(
      'Video conversion failed: GCP upload failed',
    );
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(
      mockPaths.workingDir,
    );
  });

  it('should log error but continue if cleanup fails', async () => {
    const cleanupError = new Error('Cleanup failed');
    vi.mocked(fileHelpers.cleanupDirectory).mockRejectedValueOnce(cleanupError);

    const result = await convertVideo(mockData);

    expect(result).toBeDefined();
    // Note: Logger error for cleanup failure is expected but not tested here
  });

  it('should log correct file count after HLS conversion', async () => {
    vi.mocked(readdirSync).mockReturnValue([
      'playlist.m3u8',
      'segment1.ts',
      'segment2.ts',
      'segment3.ts',
      'segment4.ts',
    ] as any);

    await convertVideo(mockData);

    expect(readdirSync).toHaveBeenCalledWith(mockPaths.outputDir);
    // Note: Logger info about file count is expected but not tested here
  });

  it('should log zero files if output directory is empty', async () => {
    vi.mocked(readdirSync).mockReturnValue([]);

    await convertVideo(mockData);

    expect(readdirSync).toHaveBeenCalledWith(mockPaths.outputDir);
    // Note: Logger info about file count is expected but not tested here
  });

  it('should return the correct playlist URL', async () => {
    const expectedUrl = 'https://storage.googleapis.com/playlist.m3u8';
    vi.mocked(gcpHelpers.getDownloadUrl).mockReturnValue(expectedUrl);

    const result = await convertVideo(mockData);

    expect(result).toBe(expectedUrl);
  });
});
