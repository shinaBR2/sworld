import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import * as path from 'path';
import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';
import { convertToHLS, getDuration, takeScreenshot } from '.';
import { existsSync } from 'fs';
import { logger } from 'src/utils/logger';

// Mock all external dependencies
vi.mock('fluent-ffmpeg');
vi.mock('@google-cloud/storage');
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));
vi.mock('./file-helpers', () => ({
  downloadFile: vi.fn(),
  uploadDirectory: vi.fn(),
  generateTempDirName: vi.fn(),
  getDownloadUrl: vi.fn(),
}));

describe('FFmpeg Helpers', () => {
  let mockFFmpeg: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock ffmpeg command chain
    mockFFmpeg = {
      outputOptions: vi.fn().mockReturnThis(),
      output: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      run: vi.fn(),
      screenshot: vi.fn().mockReturnThis(),
    };

    // Mock the ffmpeg function to return our mock chain
    (ffmpeg as unknown as Mock).mockReturnValue(mockFFmpeg);

    // Mock existsSync default behavior
    vi.mocked(existsSync).mockReturnValue(true);

    // Mock logger methods
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('convertToHLS', () => {
    const inputPath = '/path/to/input.mp4';
    const outputDir = '/path/to/output';

    it('should throw error if input file does not exist', async () => {
      vi.mocked(existsSync).mockReturnValueOnce(false);

      await expect(convertToHLS(inputPath, outputDir)).rejects.toThrow(
        'Input file does not exist'
      );
      expect(ffmpeg).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should convert video successfully', async () => {
      // Mock successful conversion
      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === 'end') {
          callback();
        }
        return mockFFmpeg;
      });

      await expect(convertToHLS(inputPath, outputDir)).resolves.not.toThrow();

      expect(ffmpeg).toHaveBeenCalledWith(inputPath);
      expect(mockFFmpeg.outputOptions).toHaveBeenCalledWith([
        '-codec copy',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls',
      ]);
      expect(mockFFmpeg.output).toHaveBeenCalledWith(
        path.join(outputDir, 'playlist.m3u8')
      );
      expect(mockFFmpeg.run).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        '[convertToHLS] HLS conversion completed successfully'
      );
    });

    it('should handle conversion errors', async () => {
      const error = new Error('Conversion failed');
      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error, '', '');
        }
        return mockFFmpeg;
      });

      await expect(convertToHLS(inputPath, outputDir)).rejects.toThrow(
        'Conversion failed'
      );
      expect(ffmpeg).toHaveBeenCalled();
      expect(mockFFmpeg.run).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should log progress during conversion', async () => {
      const progress = { percent: 50 };
      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === 'progress') {
          callback(progress);
        }
        if (event === 'end') {
          callback();
        }
        return mockFFmpeg;
      });

      await convertToHLS(inputPath, outputDir);
      expect(logger.debug).toHaveBeenCalledWith(
        progress,
        '[convertToHLS] Conversion progress:'
      );
    });
  });

  describe('getDuration', () => {
    const videoPath = '/path/to/video.mp4';

    it('should return duration for valid video', async () => {
      const mockDuration = 123.456;
      const mockFfprobe = vi.fn().mockResolvedValueOnce({
        format: { duration: mockDuration },
      } as FfprobeData);

      vi.spyOn(ffmpeg, 'ffprobe').mockImplementation((_, callback) => {
        callback(null, { format: { duration: mockDuration } } as FfprobeData);
      });

      const duration = await getDuration(videoPath);
      expect(duration).toBe(Math.floor(mockDuration));
    });

    it('should return default duration if ffprobe fails', async () => {
      vi.spyOn(ffmpeg, 'ffprobe').mockImplementation((_, callback) => {
        callback(new Error('ffprobe failed'), null);
      });

      const duration = await getDuration(videoPath);
      expect(duration).toBe(1);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return default duration if duration is undefined', async () => {
      vi.spyOn(ffmpeg, 'ffprobe').mockImplementation((_, callback) => {
        callback(null, { format: { duration: undefined } } as FfprobeData);
      });

      const duration = await getDuration(videoPath);
      expect(duration).toBe(1);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw error if file does not exist', async () => {
      vi.mocked(existsSync).mockReturnValueOnce(false);

      const duration = await getDuration(videoPath);
      expect(duration).toBe(1);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('takeScreenshot', () => {
    const videoPath = '/path/to/video.mp4';
    const outputDir = '/path/to/output';
    const filename = 'thumbnail.jpg';

    beforeEach(() => {
      // Reset ffprobe mock for each test
      vi.spyOn(ffmpeg, 'ffprobe').mockImplementation((_, callback) => {
        callback(null, { format: { duration: 30 } } as FfprobeData);
      });
    });

    it('should take screenshot at correct timestamp for short video', async () => {
      vi.spyOn(ffmpeg, 'ffprobe').mockImplementation((_, callback) => {
        callback(null, { format: { duration: 1.5 } } as FfprobeData);
      });

      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === 'end') callback();
        return mockFFmpeg;
      });

      await takeScreenshot(videoPath, outputDir, filename);

      expect(mockFFmpeg.screenshot).toHaveBeenCalledWith({
        timestamps: [0], // duration/3 = 0.5
        folder: outputDir,
        filename: filename,
      });
    });

    it('should take screenshot at correct timestamp for medium length video', async () => {
      vi.spyOn(ffmpeg, 'ffprobe').mockImplementation((_, callback) => {
        callback(null, { format: { duration: 15 } } as FfprobeData);
      });

      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === 'end') callback();
        return mockFFmpeg;
      });

      await takeScreenshot(videoPath, outputDir, filename);

      expect(mockFFmpeg.screenshot).toHaveBeenCalledWith({
        timestamps: [5], // 15/3 = 5
        folder: outputDir,
        filename: filename,
      });
    });

    it('should cap screenshot timestamp at 10 seconds for long video', async () => {
      vi.spyOn(ffmpeg, 'ffprobe').mockImplementation((_, callback) => {
        callback(null, { format: { duration: 60 } } as FfprobeData);
      });

      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === 'end') callback();
        return mockFFmpeg;
      });

      await takeScreenshot(videoPath, outputDir, filename);

      expect(mockFFmpeg.screenshot).toHaveBeenCalledWith({
        timestamps: [10], // duration/3 = 20, capped at 10
        folder: outputDir,
        filename: filename,
      });
    });

    it('should handle screenshot errors', async () => {
      const error = new Error('Screenshot failed');
      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === 'error') callback(error, '', '');
        return mockFFmpeg;
      });

      await expect(
        takeScreenshot(videoPath, outputDir, filename)
      ).rejects.toThrow('FFmpeg error: Screenshot failed');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should use default duration if getting duration fails', async () => {
      vi.spyOn(ffmpeg, 'ffprobe').mockImplementation((_, callback) => {
        callback(new Error('ffprobe failed'), null);
      });

      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === 'end') callback();
        return mockFFmpeg;
      });

      await takeScreenshot(videoPath, outputDir, filename);

      expect(mockFFmpeg.screenshot).toHaveBeenCalledWith({
        timestamps: [0], // Default duration = 1, so timestamp = 0
        folder: outputDir,
        filename: filename,
      });
    });
  });
});
