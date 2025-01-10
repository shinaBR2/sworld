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
        timestamps: ["00:00:03"],
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

// describe("handleConvertVideo", () => {
//   const mockUniqueDir = "mock-dir";
//   const mockWorkingDir = path.join(os.tmpdir(), mockUniqueDir);
//   const mockOutputDir = path.join(mockWorkingDir, "output");
//   const mockInputPath = path.join(mockWorkingDir, "input.mp4");

//   const mockData = {
//     id: "test-video-123",
//     videoUrl: "https://example.com/test.mp4",
//   };

//   const mockDownloadFile = videoHelpers.downloadFile as MockedFunction<
//     typeof videoHelpers.downloadFile
//   >;
//   const mockUploadDirectory = videoHelpers.uploadDirectory as MockedFunction<
//     typeof videoHelpers.uploadDirectory
//   >;
//   const mockGenerateTempDirName =
//     videoHelpers.generateTempDirName as MockedFunction<
//       typeof videoHelpers.generateTempDirName
//     >;
//   const mockGetDownloadUrl = videoHelpers.getDownloadUrl as MockedFunction<
//     typeof videoHelpers.getDownloadUrl
//   >;

//   vi.mock("fs", async () => {
//     const actual = (await vi.importActual("fs")) as object;
//     return {
//       ...actual,
//       stat: vi.fn(),
//     };
//   });

//   vi.mock("fs/promises", async () => {
//     const actual = (await vi.importActual("fs/promises")) as object;
//     return {
//       ...actual,
//       mkdir: vi.fn(),
//       rm: vi.fn(),
//     };
//   });

//   const mockStat = stat as unknown as MockedFunction<typeof stat>;
//   const mockMkdir = mkdir as MockedFunction<typeof mkdir>;
//   const mockRm = rm as MockedFunction<typeof rm>;

//   let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
//   const originalConsoleError = console.error;

//   beforeEach(() => {
//     vi.clearAllMocks();
//     // @ts-ignore
//     consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

//     const mockFfmpeg = {
//       outputOptions: vi.fn().mockReturnThis(),
//       output: vi.fn().mockReturnThis(),
//       on: vi.fn().mockReturnThis(),
//       run: vi.fn().mockImplementation(function (this: any) {
//         const endHandler = this.on.mock.calls.find(
//           (call: any[]) => call[0] === "end"
//         )[1];
//         endHandler();
//       }),
//     };
//     ffmpeg.mockReturnValue(mockFfmpeg);

//     mockGenerateTempDirName.mockReturnValue(mockUniqueDir);
//     mockDownloadFile.mockResolvedValue(undefined);
//     mockUploadDirectory.mockResolvedValue(undefined);
//     mockGetDownloadUrl.mockReturnValue(
//       "https://storage.googleapis.com/test-bucket/videos/test-video-123/playlist.m3u8"
//     );
//     mockMkdir.mockResolvedValue(undefined);
//     mockStat.mockImplementation((_, callback) =>
//       // @ts-ignore
//       callback(null, { size: 100 * 1024 * 1024 })
//     );
//     mockRm.mockResolvedValue(undefined);
//   });

//   afterEach(() => {
//     consoleErrorSpy.mockRestore();
//   });

//   afterAll(() => {
//     console.error = originalConsoleError;
//   });

//   it("successfully converts video", async () => {
//     const result = await handleConvertVideo(mockData);

//     expect(mockMkdir).toHaveBeenCalledWith(mockWorkingDir, { recursive: true });
//     expect(mockMkdir).toHaveBeenCalledWith(mockOutputDir, { recursive: true });
//     expect(mockDownloadFile).toHaveBeenCalledWith(
//       mockData.videoUrl,
//       mockInputPath
//     );
//     expect(mockStat).toHaveBeenCalled();
//     expect(mockUploadDirectory).toHaveBeenCalledWith(
//       mockOutputDir,
//       `videos/${mockData.id}`
//     );
//     expect(mockRm).toHaveBeenCalledWith(mockWorkingDir, {
//       recursive: true,
//       force: true,
//     });
//     expect(result).toBe(
//       "https://storage.googleapis.com/test-bucket/videos/test-video-123/playlist.m3u8"
//     );
//   });

//   it("handles file size limit", async () => {
//     mockStat.mockImplementationOnce((_, callback) =>
//       // @ts-ignore
//       callback(null, { size: 500 * 1024 * 1024 })
//     );

//     await expect(handleConvertVideo(mockData)).rejects.toThrow(
//       "Downloaded file too large"
//     );
//     expect(mockRm).toHaveBeenCalled();
//     expect(mockUploadDirectory).not.toHaveBeenCalled();
//   });

//   it("handles download failure", async () => {
//     mockDownloadFile.mockRejectedValueOnce(new Error("Download failed"));

//     await expect(handleConvertVideo(mockData)).rejects.toThrow(
//       "Download failed"
//     );
//     expect(mockRm).toHaveBeenCalled();
//     expect(mockUploadDirectory).not.toHaveBeenCalled();
//   });

//   it("handles ffmpeg failure", async () => {
//     const mockFfmpeg = {
//       outputOptions: vi.fn().mockReturnThis(),
//       output: vi.fn().mockReturnThis(),
//       on: vi.fn().mockReturnThis(),
//       run: vi.fn().mockImplementation(function (this: any) {
//         const errorHandler = this.on.mock.calls.find(
//           (call: any[]) => call[0] === "error"
//         )[1];
//         errorHandler(new Error("Conversion failed"));
//       }),
//     };
//     ffmpeg.mockReturnValue(mockFfmpeg);

//     await expect(handleConvertVideo(mockData)).rejects.toThrow(
//       "Conversion failed"
//     );
//     expect(mockRm).toHaveBeenCalled();
//     expect(mockUploadDirectory).not.toHaveBeenCalled();
//   });

//   it("handles upload failure", async () => {
//     mockUploadDirectory.mockRejectedValueOnce(new Error("Upload failed"));

//     await expect(handleConvertVideo(mockData)).rejects.toThrow("Upload failed");
//     expect(mockRm).toHaveBeenCalled();
//   });
// });
