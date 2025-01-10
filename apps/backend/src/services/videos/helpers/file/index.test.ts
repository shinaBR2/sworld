import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  generateTempDirName,
  downloadFile,
  createDirectory,
  cleanupDirectory,
  verifyFileSize,
} from ".";
import { createWriteStream, unlink, stat } from "fs";
import { mkdir, rm } from "fs/promises";
import * as path from "path";

// Mock all filesystem-related modules
vi.mock("fs");
vi.mock("fs/promises");
vi.mock("firebase-admin/storage");
vi.mock("path");

describe("File Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateTempDirName", () => {
    it("generates 32-char hex string", () => {
      const result = generateTempDirName();
      expect(result).toMatch(/^[0-9a-f]{32}$/);
    });

    it("generates unique values", () => {
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(generateTempDirName());
      }
      expect(results.size).toBe(10);
    });
  });

  describe("downloadFile", () => {
    const mockUrl = "https://example.com/file.mp4";
    const mockPath = "/tmp/file.mp4";
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

    it("downloads file successfully", async () => {
      const mockBody = {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: Buffer.from("chunk1"),
            })
            .mockResolvedValueOnce({
              done: false,
              value: Buffer.from("chunk2"),
            })
            .mockResolvedValueOnce({ done: true }),
        }),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-length": "1000" }),
        body: mockBody,
      });

      await downloadFile(mockUrl, mockPath);

      expect(mockWriteStream.write).toHaveBeenCalledTimes(2);
      expect(mockWriteStream.end).toHaveBeenCalled();
    });

    it("rejects large files", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-length": "500000000" }),
      });

      await expect(downloadFile(mockUrl, mockPath)).rejects.toThrow(
        "File too large"
      );
    });

    it("handles failed fetch", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      });

      await expect(downloadFile(mockUrl, mockPath)).rejects.toThrow(
        "Failed to fetch"
      );
    });

    it("handles missing response body", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-length": "1000" }),
        body: null,
      });

      await expect(downloadFile(mockUrl, mockPath)).rejects.toThrow(
        "No response body"
      );
      expect(unlink).toHaveBeenCalled();
    });

    it("handles stream error", async () => {
      const mockError = new Error("Stream error");
      mockWriteStream.on.mockImplementation((event, callback) => {
        if (event === "error") {
          callback(mockError);
        }
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-length": "1000" }),
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

  describe("createDirectory", () => {
    it("creates directory successfully", async () => {
      vi.mocked(mkdir).mockResolvedValue(undefined);

      await createDirectory("/test/dir");

      expect(mkdir).toHaveBeenCalledWith("/test/dir", { recursive: true });
    });

    it("handles directory creation error", async () => {
      const error = new Error("Permission denied");
      vi.mocked(mkdir).mockRejectedValue(error);

      await expect(createDirectory("/test/dir")).rejects.toThrow(error);
    });
  });

  describe("cleanupDirectory", () => {
    beforeEach(() => {
      vi.mocked(stat).mockImplementation((_, callback) =>
        callback(null, { isFile: () => false })
      );
      vi.mocked(unlink).mockImplementation((_, callback) => callback(null));
    });

    it("removes directory successfully", async () => {
      vi.mocked(stat).mockImplementation((_, callback) =>
        callback(null, { isFile: () => false })
      );
      vi.mocked(rm).mockResolvedValue(undefined);

      await cleanupDirectory("/test/dir");

      expect(rm).toHaveBeenCalledWith("/test/dir", {
        recursive: true,
        force: true,
      });
    });

    it("removes file successfully", async () => {
      vi.mocked(stat).mockImplementation((_, callback) =>
        callback(null, { isFile: () => true })
      );

      await cleanupDirectory("/test/file.mp4");

      expect(unlink).toHaveBeenCalled();
    });

    it("handles cleanup error gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Cleanup failed");
      vi.mocked(rm).mockRejectedValue(error);

      await cleanupDirectory("/test/dir");

      expect(consoleErrorSpy).toHaveBeenCalledWith("Cleanup failed:", error);
      consoleErrorSpy.mockRestore();
    });

    it("handles stat error gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Stat failed");
      vi.mocked(stat).mockImplementation((_, callback) => callback(error));

      await cleanupDirectory("/test/dir");

      expect(consoleErrorSpy).toHaveBeenCalledWith("Cleanup failed:", error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("verifyFileSize", () => {
    it("accepts file within size limit", async () => {
      vi.mocked(stat).mockImplementation((_, callback) =>
        callback(null, { size: 1000 } as any)
      );

      await expect(
        verifyFileSize("/test/file.mp4", 2000)
      ).resolves.not.toThrow();
    });

    it("rejects file exceeding size limit", async () => {
      vi.mocked(stat).mockImplementation((_, callback) =>
        callback(null, { size: 3000 } as any)
      );

      await expect(verifyFileSize("/test/file.mp4", 2000)).rejects.toThrow(
        "Downloaded file too large for processing"
      );
    });

    it("handles stat error", async () => {
      const error = new Error("File not found");
      vi.mocked(stat).mockImplementation((_, callback) =>
        callback(error, null as any)
      );

      await expect(verifyFileSize("/test/file.mp4", 2000)).rejects.toThrow(
        error
      );
    });
  });
});
