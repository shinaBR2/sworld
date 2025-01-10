import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as path from "path";
// @ts-ignore
import ffmpeg from "fluent-ffmpeg";
import { convertToHLS, takeScreenshot } from ".";

vi.mock("fluent-ffmpeg");
vi.mock("@google-cloud/storage");
vi.mock("./file-helpers", () => ({
  downloadFile: vi.fn(),
  uploadDirectory: vi.fn(),
  generateTempDirName: vi.fn(),
  getDownloadUrl: vi.fn(),
}));

describe("FFmpeg Helpers", () => {
  let mockFFmpeg: any;

  beforeEach(() => {
    // Reset all mocks
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
    (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFFmpeg);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("convertToHLS", () => {
    const inputPath = "/path/to/input.mp4";
    const outputDir = "/path/to/output";

    it("should convert video successfully", async () => {
      // Setup the success case
      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === "end") {
          callback();
        }
        return mockFFmpeg;
      });

      await expect(convertToHLS(inputPath, outputDir)).resolves.not.toThrow();

      // Verify ffmpeg was called with correct parameters
      expect(ffmpeg).toHaveBeenCalledWith(inputPath);
      expect(mockFFmpeg.outputOptions).toHaveBeenCalledWith([
        "-codec copy",
        "-start_number 0",
        "-hls_time 10",
        "-hls_list_size 0",
        "-f hls",
      ]);
      expect(mockFFmpeg.output).toHaveBeenCalledWith(
        path.join(outputDir, "playlist.m3u8")
      );
      expect(mockFFmpeg.run).toHaveBeenCalled();
    });

    it("should handle conversion errors", async () => {
      const error = new Error("Conversion failed");

      // Setup the error case
      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === "error") {
          callback(error);
        }
        return mockFFmpeg;
      });

      await expect(convertToHLS(inputPath, outputDir)).rejects.toThrow(error);
      expect(mockFFmpeg.run).toHaveBeenCalled();
    });
  });

  describe("takeScreenshot", () => {
    const videoPath = "/path/to/video.mp4";
    const outputDir = "/path/to/output";
    const filename = "thumbnail.jpg";

    it("should take screenshot successfully", async () => {
      // Setup the success case
      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === "end") {
          callback();
        }
        return mockFFmpeg;
      });

      await expect(
        takeScreenshot(videoPath, outputDir, filename)
      ).resolves.not.toThrow();

      // Verify ffmpeg was called with correct parameters
      expect(ffmpeg).toHaveBeenCalledWith(videoPath);
      expect(mockFFmpeg.screenshot).toHaveBeenCalledWith({
        timestamps: ["00:03:03"],
        folder: outputDir,
        filename: filename,
      });
    });

    it("should handle screenshot errors with ffmpeg output", async () => {
      const error = new Error("Screenshot failed");
      const stdout = "FFmpeg process output";
      const stderr = "FFmpeg process error output";

      // Setup console.error mock
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Setup the error case
      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === "error") {
          callback(error, stdout, stderr);
        }
        return mockFFmpeg;
      });

      await expect(
        takeScreenshot(videoPath, outputDir, filename)
      ).rejects.toThrow("FFmpeg error: Screenshot failed");

      // Verify error logging
      expect(consoleSpy).toHaveBeenCalledWith("FFmpeg stdout:", stdout);
      expect(consoleSpy).toHaveBeenCalledWith("FFmpeg stderr:", stderr);

      // Cleanup
      consoleSpy.mockRestore();
    });

    it("should handle screenshot errors without ffmpeg output", async () => {
      const error = new Error("Screenshot failed");

      // Setup the error case
      mockFFmpeg.on.mockImplementation((event, callback) => {
        if (event === "error") {
          callback(error);
        }
        return mockFFmpeg;
      });

      await expect(
        takeScreenshot(videoPath, outputDir, filename)
      ).rejects.toThrow("FFmpeg error: Screenshot failed");
    });
  });
});
