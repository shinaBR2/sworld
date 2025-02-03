import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import 'src/database/__mocks__/sequelize';
import { convertVideo, type ConversionVideo } from './handler';
import * as fileHelpers from '../helpers/file';
import * as gcpHelpers from '../helpers/gcp-cloud-storage';
import * as ffmpegHelpers from '../helpers/ffmpeg';
import * as cloudinaryHelpers from '../helpers/cloudinary';
import { logger } from 'src/utils/logger';
import { existsSync, statSync } from 'fs';
import path from 'path';
import { finalizeVideo } from 'src/database/queries/videos';

// Mock all external dependencies
vi.mock('../helpers/file');
vi.mock('../helpers/gcp-cloud-storage');
vi.mock('../helpers/ffmpeg');
vi.mock('../helpers/cloudinary');
vi.mock('src/utils/logger');
vi.mock('fs');

vi.mock('src/database/queries/videos', () => ({
  finalizeVideo: vi.fn(),
}));

describe('convertVideo', () => {
  const mockData: ConversionVideo = {
    id: 'test-video-123',
    videoUrl: 'https://example.com/video.mp4',
    userId: 'user-123',
  };

  const tempDir = '/temp/test-dir';
  const mockPaths = {
    workingDir: tempDir,
    outputDir: path.join(tempDir, 'output'),
    inputPath: path.join(tempDir, 'input.mp4'),
    thumbnailPathPattern: new RegExp(path.join(tempDir, 'test-video-123--\\d+\\.jpg').replace(/\\/g, '\\\\')),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock generateTempDir to return consistent path
    vi.mocked(fileHelpers.generateTempDir).mockReturnValue(tempDir);

    // Mock file existence checks
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(statSync).mockReturnValue({ size: 1000000 } as any);

    // Mock successful file operations
    vi.mocked(fileHelpers.createDirectory).mockResolvedValue(undefined);
    vi.mocked(fileHelpers.downloadFile).mockResolvedValue(undefined);
    vi.mocked(fileHelpers.verifyFileSize).mockResolvedValue(undefined);
    vi.mocked(fileHelpers.cleanupDirectory).mockResolvedValue(undefined);

    // Mock successful conversions
    vi.mocked(ffmpegHelpers.convertToHLS).mockResolvedValue(undefined);
    vi.mocked(ffmpegHelpers.takeScreenshot).mockResolvedValue(undefined);

    // Mock successful uploads
    vi.mocked(cloudinaryHelpers.uploadFromLocalFilePath).mockResolvedValue('https://cloudinary.com/thumbnail.jpg');
    vi.mocked(gcpHelpers.uploadDirectory).mockResolvedValue(undefined);
    vi.mocked(gcpHelpers.getDownloadUrl).mockReturnValue('https://storage.googleapis.com/playlist.m3u8');

    // Mock logger
    vi.spyOn(logger, 'debug').mockImplementation(() => {});
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully convert a video', async () => {
    const playableUrl = await convertVideo(mockData);

    // Verify directories were created
    expect(fileHelpers.createDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(fileHelpers.createDirectory).toHaveBeenCalledWith(mockPaths.outputDir);

    // Verify video download and verification
    expect(fileHelpers.downloadFile).toHaveBeenCalledWith(mockData.videoUrl, mockPaths.inputPath);
    expect(fileHelpers.verifyFileSize).toHaveBeenCalledWith(mockPaths.inputPath, 400 * 1024 * 1024);

    // Verify video conversion
    expect(ffmpegHelpers.convertToHLS).toHaveBeenCalledWith(mockPaths.inputPath, mockPaths.outputDir);
    expect(ffmpegHelpers.takeScreenshot).toHaveBeenCalledWith(
      mockPaths.inputPath,
      mockPaths.workingDir,
      expect.stringMatching(/test-video-123--\d+\.jpg/)
    );

    // Verify uploads
    expect(cloudinaryHelpers.uploadFromLocalFilePath).toHaveBeenCalledWith(
      expect.stringMatching(/test-video-123--\d+\.jpg$/),
      {
        asset_folder: mockData.userId,
      }
    );
    expect(gcpHelpers.uploadDirectory).toHaveBeenCalledWith(
      mockPaths.outputDir,
      `videos/${mockData.userId}/${mockData.id}`
    );

    // Verify database update
    expect(finalizeVideo).toHaveBeenCalledWith({
      id: mockData.id,
      source: 'https://storage.googleapis.com/playlist.m3u8',
      thumbnailUrl: 'https://cloudinary.com/thumbnail.jpg',
    });

    // Verify cleanup
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(playableUrl).toBe('https://storage.googleapis.com/playlist.m3u8');
  });

  it('should throw error if directory creation fails', async () => {
    const error = new Error('Failed to create directory');
    vi.mocked(fileHelpers.createDirectory).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow('Video conversion failed: Failed to create directory');
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw error if video download fails', async () => {
    const error = new Error('Download failed');
    vi.mocked(fileHelpers.downloadFile).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow('Video conversion failed: Download failed');
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw error if HLS conversion fails', async () => {
    const error = new Error('Conversion failed');
    vi.mocked(ffmpegHelpers.convertToHLS).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow('Video conversion failed: Conversion failed');
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw error if input file is missing after conversion', async () => {
    vi.mocked(existsSync).mockReturnValueOnce(false);

    await expect(convertVideo(mockData)).rejects.toThrow(
      'Video conversion failed: Input file missing after HLS conversion'
    );
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw error if screenshot generation fails', async () => {
    const error = new Error('Screenshot failed');
    vi.mocked(ffmpegHelpers.takeScreenshot).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow('Video conversion failed: Screenshot failed');
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw error if screenshot file is not created', async () => {
    vi.mocked(ffmpegHelpers.takeScreenshot).mockResolvedValue(undefined);
    vi.mocked(existsSync)
      .mockReturnValueOnce(true) // for input file check
      .mockReturnValueOnce(false); // for screenshot file check

    await expect(convertVideo(mockData)).rejects.toThrow('Video conversion failed: Screenshot file not created');
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw error if cloudinary upload fails', async () => {
    const error = new Error('Upload failed');
    vi.mocked(cloudinaryHelpers.uploadFromLocalFilePath).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow('Video conversion failed: Upload failed');
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw error if GCP upload fails', async () => {
    const error = new Error('GCP upload failed');
    vi.mocked(gcpHelpers.uploadDirectory).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow('Video conversion failed: GCP upload failed');
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw error if database update fails', async () => {
    const error = new Error('Database update failed');
    vi.mocked(finalizeVideo).mockRejectedValueOnce(error);

    await expect(convertVideo(mockData)).rejects.toThrow('Video conversion failed: Database update failed');
    expect(fileHelpers.cleanupDirectory).toHaveBeenCalledWith(mockPaths.workingDir);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should log error but continue if cleanup fails', async () => {
    const cleanupError = new Error('Cleanup failed');
    vi.mocked(fileHelpers.cleanupDirectory).mockRejectedValueOnce(cleanupError);

    await convertVideo(mockData);

    expect(logger.error).toHaveBeenCalledWith(
      cleanupError,
      expect.stringMatching(/Failed to clean up working directory/)
    );
  });
});
