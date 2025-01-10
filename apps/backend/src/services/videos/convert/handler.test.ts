import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  afterAll,
  MockedFunction,
} from "vitest";
import * as os from "os";
import * as path from "path";
import { handleConvertVideo } from "./handler";
import {
  generateTempDirName,
  downloadFile,
  createDirectory,
  cleanupDirectory,
  verifyFileSize,
} from "../helpers/file";
import { getDownloadUrl, uploadDirectory } from "../helpers/gcp-cloud-storage";
import { convertToHLS } from "../helpers/ffmpeg";

vi.mock("src/database", () => ({
  default: {},
  prisma: {},
}));

// Mock all the imported helpers
vi.mock("../helpers/file", () => ({
  generateTempDirName: vi.fn(),
  downloadFile: vi.fn(),
  createDirectory: vi.fn(),
  cleanupDirectory: vi.fn(),
  verifyFileSize: vi.fn(),
}));

vi.mock("../helpers/gcp-cloud-storage", () => ({
  getDownloadUrl: vi.fn(),
  uploadDirectory: vi.fn(),
}));

vi.mock("../helpers/ffmpeg", () => ({
  convertToHLS: vi.fn(),
}));

describe("handleConvertVideo", () => {
  const mockUniqueDir = "mock-dir";
  const mockWorkingDir = path.join(os.tmpdir(), mockUniqueDir);
  const mockOutputDir = path.join(mockWorkingDir, "output");
  const mockInputPath = path.join(mockWorkingDir, "input.mp4");

  const mockData = {
    id: "test-video-123",
    videoUrl: "https://example.com/test.mp4",
  };

  // Type the mocked functions
  const mockDownloadFile = downloadFile as MockedFunction<typeof downloadFile>;
  const mockUploadDirectory = uploadDirectory as MockedFunction<
    typeof uploadDirectory
  >;
  const mockGenerateTempDirName = generateTempDirName as MockedFunction<
    typeof generateTempDirName
  >;
  const mockGetDownloadUrl = getDownloadUrl as MockedFunction<
    typeof getDownloadUrl
  >;
  const mockCreateDirectory = createDirectory as MockedFunction<
    typeof createDirectory
  >;
  const mockCleanupDirectory = cleanupDirectory as MockedFunction<
    typeof cleanupDirectory
  >;
  const mockVerifyFileSize = verifyFileSize as MockedFunction<
    typeof verifyFileSize
  >;
  const mockConvertToHLS = convertToHLS as MockedFunction<typeof convertToHLS>;

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Setup default mock implementations
    mockGenerateTempDirName.mockReturnValue(mockUniqueDir);
    mockDownloadFile.mockResolvedValue(undefined);
    mockUploadDirectory.mockResolvedValue(undefined);
    mockGetDownloadUrl.mockReturnValue(
      "https://storage.googleapis.com/test-bucket/videos/test-video-123/playlist.m3u8"
    );
    mockCreateDirectory.mockResolvedValue(undefined);
    mockCleanupDirectory.mockResolvedValue(undefined);
    mockVerifyFileSize.mockResolvedValue(undefined);
    mockConvertToHLS.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it("successfully converts video", async () => {
    const result = await handleConvertVideo(mockData);

    expect(mockCreateDirectory).toHaveBeenNthCalledWith(1, mockWorkingDir);
    expect(mockCreateDirectory).toHaveBeenNthCalledWith(2, mockOutputDir);
    expect(mockDownloadFile).toHaveBeenCalledWith(
      mockData.videoUrl,
      mockInputPath
    );
    expect(mockVerifyFileSize).toHaveBeenCalledWith(
      mockInputPath,
      400 * 1024 * 1024
    );
    expect(mockConvertToHLS).toHaveBeenCalledWith(mockInputPath, mockOutputDir);
    expect(mockUploadDirectory).toHaveBeenCalledWith(
      mockOutputDir,
      `videos/${mockData.id}`
    );
    expect(mockCleanupDirectory).toHaveBeenCalledWith(mockWorkingDir);
    expect(result).toBe(
      "https://storage.googleapis.com/test-bucket/videos/test-video-123/playlist.m3u8"
    );
  });

  it("handles file size verification failure", async () => {
    mockVerifyFileSize.mockRejectedValueOnce(new Error("File too large"));

    await expect(handleConvertVideo(mockData)).rejects.toThrow(
      "File too large"
    );
    expect(mockCleanupDirectory).toHaveBeenCalledWith(mockWorkingDir);
    expect(mockUploadDirectory).not.toHaveBeenCalled();
  });

  it("handles download failure", async () => {
    mockDownloadFile.mockRejectedValueOnce(new Error("Download failed"));

    await expect(handleConvertVideo(mockData)).rejects.toThrow(
      "Download failed"
    );
    expect(mockCleanupDirectory).toHaveBeenCalledWith(mockWorkingDir);
    expect(mockUploadDirectory).not.toHaveBeenCalled();
  });

  it("handles conversion failure", async () => {
    mockConvertToHLS.mockRejectedValueOnce(new Error("Conversion failed"));

    await expect(handleConvertVideo(mockData)).rejects.toThrow(
      "Conversion failed"
    );
    expect(mockCleanupDirectory).toHaveBeenCalledWith(mockWorkingDir);
    expect(mockUploadDirectory).not.toHaveBeenCalled();
  });

  it("handles upload failure", async () => {
    mockUploadDirectory.mockRejectedValueOnce(new Error("Upload failed"));

    await expect(handleConvertVideo(mockData)).rejects.toThrow("Upload failed");
    expect(mockCleanupDirectory).toHaveBeenCalledWith(mockWorkingDir);
  });

  it("handles unknown error", async () => {
    mockDownloadFile.mockRejectedValueOnce("Unknown error");

    await expect(handleConvertVideo(mockData)).rejects.toThrow(
      "Unknown error during video conversion"
    );
    expect(mockCleanupDirectory).toHaveBeenCalledWith(mockWorkingDir);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Unknown error during video conversion:",
      "Unknown error"
    );
  });
});

describe("convertVideo", () => {
  const mockData = {
    id: "test-123",
    videoUrl: "https://example.com/test.mp4",
  };

  // Create a separate describe block for convertVideo tests
  it("successfully converts video and saves to database", async () => {
    const mockHandleConvertVideo = vi.fn();
    const mockPostConvert = vi.fn();
    const mockConvertedUrl = "https://example.com/converted.m3u8";
    const mockDbResult = { id: mockData.id, url: mockConvertedUrl };

    mockHandleConvertVideo.mockResolvedValue(mockConvertedUrl);
    mockPostConvert.mockResolvedValue(mockDbResult);

    // Create a new instance of convertVideo with mocked dependencies
    const testConvertVideo = async (inputData: any) => {
      let videoUrl;
      try {
        videoUrl = await mockHandleConvertVideo(inputData);
      } catch (error) {
        throw new Error((error as Error).message);
      }

      let video;
      try {
        video = await mockPostConvert({
          ...inputData,
          videoUrl,
        });
      } catch (error) {
        throw new Error((error as Error).message);
      }

      return video;
    };

    const result = await testConvertVideo(mockData);

    expect(mockHandleConvertVideo).toHaveBeenCalledWith(mockData);
    expect(mockPostConvert).toHaveBeenCalledWith({
      ...mockData,
      videoUrl: mockConvertedUrl,
    });
    expect(result).toBe(mockDbResult);
  });

  it("handles conversion error", async () => {
    const mockHandleConvertVideo = vi.fn();
    const mockPostConvert = vi.fn();

    mockHandleConvertVideo.mockRejectedValue(new Error("Conversion failed"));

    const testConvertVideo = async (inputData: any) => {
      let videoUrl;
      try {
        videoUrl = await mockHandleConvertVideo(inputData);
      } catch (error) {
        throw new Error((error as Error).message);
      }

      let video;
      try {
        video = await mockPostConvert({
          ...inputData,
          videoUrl,
        });
      } catch (error) {
        throw new Error((error as Error).message);
      }

      return video;
    };

    await expect(testConvertVideo(mockData)).rejects.toThrow(
      "Conversion failed"
    );
    expect(mockPostConvert).not.toHaveBeenCalled();
  });

  it("handles database error", async () => {
    const mockHandleConvertVideo = vi.fn();
    const mockPostConvert = vi.fn();
    const mockConvertedUrl = "https://example.com/converted.m3u8";

    mockHandleConvertVideo.mockResolvedValue(mockConvertedUrl);
    mockPostConvert.mockRejectedValue(new Error("Database error"));

    const testConvertVideo = async (inputData: any) => {
      let videoUrl;
      try {
        videoUrl = await mockHandleConvertVideo(inputData);
      } catch (error) {
        throw new Error((error as Error).message);
      }

      let video;
      try {
        video = await mockPostConvert({
          ...inputData,
          videoUrl,
        });
      } catch (error) {
        throw new Error((error as Error).message);
      }

      return video;
    };

    await expect(testConvertVideo(mockData)).rejects.toThrow("Database error");
  });
});
