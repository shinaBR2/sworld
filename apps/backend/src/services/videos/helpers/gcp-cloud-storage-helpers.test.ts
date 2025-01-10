// src/services/videos/helpers/__tests__/gcp-cloud-storage-helpers.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStorage } from "firebase-admin/storage";
import { readdir } from "fs/promises";
import path from "path";
import {
  getDownloadUrl,
  uploadFile,
  uploadDirectory,
} from "./gcp-cloud-storage-helpers";

// Create mock functions
const uploadMock = vi.fn().mockResolvedValue([{}]);
const bucketMock = vi.fn(() => ({
  name: "test-bucket",
  upload: uploadMock,
}));

// Mock firebase-admin/storage
vi.mock("firebase-admin/storage", () => ({
  getStorage: vi.fn(() => ({
    bucket: bucketMock,
  })),
}));

// Mock fs/promises
vi.mock("fs/promises", () => ({
  readdir: vi.fn(),
}));

describe("gcp-cloud-storage-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDownloadUrl", () => {
    it("should return correct download URL", () => {
      const outputPath = "videos/test-123/playlist.m3u8";
      const expected =
        "https://storage.googleapis.com/test-bucket/videos/test-123/playlist.m3u8";

      expect(getDownloadUrl(outputPath)).toBe(expected);
      expect(bucketMock).toHaveBeenCalled();
    });
  });

  describe("uploadFile", () => {
    it("should upload file with default options", async () => {
      const localPath = "/tmp/test.mp4";
      const storagePath = "videos/test.mp4";

      await uploadFile(localPath, storagePath);

      expect(uploadMock).toHaveBeenCalledWith(localPath, {
        destination: storagePath,
        resumable: true,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });
    });

    it("should upload file with custom options", async () => {
      const localPath = "/tmp/test.mp4";
      const storagePath = "videos/test.mp4";
      const options = {
        cacheControl: "private, max-age=3600",
        resumable: false,
      };

      await uploadFile(localPath, storagePath, options);

      expect(uploadMock).toHaveBeenCalledWith(localPath, {
        destination: storagePath,
        resumable: false,
        metadata: {
          cacheControl: "private, max-age=3600",
        },
      });
    });

    it("should handle upload errors", async () => {
      const error = new Error("Upload failed");
      uploadMock.mockRejectedValueOnce(error);

      await expect(
        uploadFile("/tmp/test.mp4", "videos/test.mp4")
      ).rejects.toThrow("Upload failed");
    });
  });

  describe("uploadDirectory", () => {
    it("should upload files in batches", async () => {
      const localDir = "/tmp/videos";
      const storagePath = "videos/test";
      const files = ["1.ts", "2.ts", "3.ts", "4.ts", "5.ts"];

      vi.mocked(readdir).mockResolvedValue(files as any);

      await uploadDirectory(localDir, storagePath);

      expect(readdir).toHaveBeenCalledWith(localDir);
      expect(uploadMock).toHaveBeenCalledTimes(5);

      // Verify first file upload
      expect(uploadMock).toHaveBeenCalledWith(path.join(localDir, "1.ts"), {
        destination: path.join(storagePath, "1.ts"),
        resumable: true,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });
    });

    it("should handle empty directory", async () => {
      vi.mocked(readdir).mockResolvedValue([]);

      await uploadDirectory("/tmp/videos", "videos/test");

      expect(readdir).toHaveBeenCalled();
      expect(uploadMock).not.toHaveBeenCalled();
    });

    it("should use custom batch size", async () => {
      const localDir = "/tmp/videos";
      const storagePath = "videos/test";
      const files = ["1.ts", "2.ts", "3.ts", "4.ts"];

      vi.mocked(readdir).mockResolvedValue(files as any);

      await uploadDirectory(localDir, storagePath, { batchSize: 2 });

      expect(uploadMock).toHaveBeenCalledTimes(4);
      expect(uploadMock).toHaveBeenCalledWith(
        path.join(localDir, "1.ts"),
        expect.any(Object)
      );
    });

    it("should handle directory upload errors", async () => {
      vi.mocked(readdir).mockRejectedValue(new Error("Read directory failed"));

      await expect(
        uploadDirectory("/tmp/videos", "videos/test")
      ).rejects.toThrow("Read directory failed");
    });
  });
});
