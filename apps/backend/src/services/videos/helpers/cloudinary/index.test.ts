import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { uploadFromLocalFilePath } from ".";
import { envConfig } from "src/utils/envConfig";

// Mock the cloudinary module
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(),
    },
  },
}));

// Mock the envConfig
vi.mock("src/utils/envConfig", () => ({
  envConfig: {
    cloudinaryName: "test-cloud",
    cloudinaryApiKey: "test-api-key",
    cloudinaryApiSecret: "test-secret",
  },
}));

describe("uploadFromLocalFilePath", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset all mocks after each test
    vi.resetAllMocks();
  });

  it("should configure cloudinary with correct credentials", async () => {
    // Setup
    const localFilePath = "/path/to/file.mp4";
    const mockUploadResponse = {
      url: "https://cloudinary.com/test-video.mp4",
    } as UploadApiResponse;
    vi.mocked(cloudinary.uploader.upload).mockResolvedValueOnce(
      mockUploadResponse
    );

    // Execute
    await uploadFromLocalFilePath(localFilePath);

    // Assert
    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: envConfig.cloudinaryName,
      api_key: envConfig.cloudinaryApiKey,
      api_secret: envConfig.cloudinaryApiSecret,
    });
  });

  it("should upload file with correct path and return url", async () => {
    // Setup
    const localFilePath = "/path/to/file.mp4";
    const mockUploadResponse = { url: "https://cloudinary.com/test-video.mp4" };
    vi.mocked(cloudinary.uploader.upload).mockResolvedValueOnce(
      mockUploadResponse as UploadApiResponse
    );

    // Execute
    const result = await uploadFromLocalFilePath(localFilePath);

    // Assert
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(localFilePath, {});
    expect(result).toBe(mockUploadResponse.url);
  });

  it("should pass additional options to upload", async () => {
    // Setup
    const localFilePath = "/path/to/file.mp4";
    const options = { folder: "videos", resource_type: "video" };
    const mockUploadResponse = { url: "https://cloudinary.com/test-video.mp4" };
    vi.mocked(cloudinary.uploader.upload).mockResolvedValueOnce(
      mockUploadResponse as UploadApiResponse
    );

    // Execute
    const result = await uploadFromLocalFilePath(localFilePath, options);

    // Assert
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      localFilePath,
      options
    );
    expect(result).toBe(mockUploadResponse.url);
  });

  it("should handle upload errors and return empty string", async () => {
    // Setup
    const localFilePath = "/path/to/file.mp4";
    const mockError = new Error("Upload failed");
    vi.mocked(cloudinary.uploader.upload).mockRejectedValueOnce(mockError);

    // Spy on console.log
    const consoleSpy = vi.spyOn(console, "log");

    // Execute
    const result = await uploadFromLocalFilePath(localFilePath);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(result).toBe("");

    // Cleanup
    consoleSpy.mockRestore();
  });

  it("should handle undefined upload result and return empty string", async () => {
    // Setup
    const localFilePath = "/path/to/file.mp4";
    vi.mocked(cloudinary.uploader.upload).mockResolvedValueOnce(
      undefined as unknown as UploadApiResponse
    );

    // Execute
    const result = await uploadFromLocalFilePath(localFilePath);

    // Assert
    expect(result).toBe("");
  });
});
