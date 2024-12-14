import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterAll,
  afterEach,
  MockedFunction,
} from 'vitest';
import * as os from 'os';
import * as path from 'path';
import { stat } from 'fs';
import { mkdir, rm } from 'fs/promises';
// @ts-ignore
import ffmpeg from 'fluent-ffmpeg';
import { handleConvertVideo } from './ffmpeg-helpers';
import * as videoHelpers from './file-helpers';

vi.mock('fluent-ffmpeg');
vi.mock('@google-cloud/storage');
vi.mock('./file-helpers', () => ({
  downloadFile: vi.fn(),
  uploadDirectory: vi.fn(),
  generateTempDirName: vi.fn(),
  getDownloadUrl: vi.fn(),
}));

describe('handleConvertVideo', () => {
  const mockUniqueDir = 'mock-dir';
  const mockWorkingDir = path.join(os.tmpdir(), mockUniqueDir);
  const mockOutputDir = path.join(mockWorkingDir, 'output');
  const mockInputPath = path.join(mockWorkingDir, 'input.mp4');

  const mockData = {
    id: 'test-video-123',
    videoUrl: 'https://example.com/test.mp4',
  };

  const mockDownloadFile = videoHelpers.downloadFile as MockedFunction<
    typeof videoHelpers.downloadFile
  >;
  const mockUploadDirectory = videoHelpers.uploadDirectory as MockedFunction<
    typeof videoHelpers.uploadDirectory
  >;
  const mockGenerateTempDirName =
    videoHelpers.generateTempDirName as MockedFunction<
      typeof videoHelpers.generateTempDirName
    >;
  const mockGetDownloadUrl = videoHelpers.getDownloadUrl as MockedFunction<
    typeof videoHelpers.getDownloadUrl
  >;

  vi.mock('fs', async () => {
    const actual = (await vi.importActual('fs')) as object;
    return {
      ...actual,
      stat: vi.fn(),
    };
  });

  vi.mock('fs/promises', async () => {
    const actual = (await vi.importActual('fs/promises')) as object;
    return {
      ...actual,
      mkdir: vi.fn(),
      rm: vi.fn(),
    };
  });

  const mockStat = stat as unknown as MockedFunction<typeof stat>;
  const mockMkdir = mkdir as MockedFunction<typeof mkdir>;
  const mockRm = rm as MockedFunction<typeof rm>;

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockFfmpeg = {
      outputOptions: vi.fn().mockReturnThis(),
      output: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      run: vi.fn().mockImplementation(function (this: any) {
        const endHandler = this.on.mock.calls.find(
          (call: any[]) => call[0] === 'end'
        )[1];
        endHandler();
      }),
    };
    ffmpeg.mockReturnValue(mockFfmpeg);

    mockGenerateTempDirName.mockReturnValue(mockUniqueDir);
    mockDownloadFile.mockResolvedValue(undefined);
    mockUploadDirectory.mockResolvedValue(undefined);
    mockGetDownloadUrl.mockReturnValue(
      'https://storage.googleapis.com/test-bucket/videos/test-video-123/playlist.m3u8'
    );
    mockMkdir.mockResolvedValue(undefined);
    mockStat.mockImplementation((_, callback) =>
      // @ts-ignore
      callback(null, { size: 100 * 1024 * 1024 })
    );
    mockRm.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('successfully converts video', async () => {
    const result = await handleConvertVideo(mockData);

    expect(mockMkdir).toHaveBeenCalledWith(mockWorkingDir, { recursive: true });
    expect(mockMkdir).toHaveBeenCalledWith(mockOutputDir, { recursive: true });
    expect(mockDownloadFile).toHaveBeenCalledWith(
      mockData.videoUrl,
      mockInputPath
    );
    expect(mockStat).toHaveBeenCalled();
    expect(mockUploadDirectory).toHaveBeenCalledWith(
      mockOutputDir,
      `videos/${mockData.id}`
    );
    expect(mockRm).toHaveBeenCalledWith(mockWorkingDir, {
      recursive: true,
      force: true,
    });
    expect(result).toBe(
      'https://storage.googleapis.com/test-bucket/videos/test-video-123/playlist.m3u8'
    );
  });

  it('handles file size limit', async () => {
    mockStat.mockImplementationOnce((_, callback) =>
      // @ts-ignore
      callback(null, { size: 500 * 1024 * 1024 })
    );

    await expect(handleConvertVideo(mockData)).rejects.toThrow(
      'Downloaded file too large'
    );
    expect(mockRm).toHaveBeenCalled();
    expect(mockUploadDirectory).not.toHaveBeenCalled();
  });

  it('handles download failure', async () => {
    mockDownloadFile.mockRejectedValueOnce(new Error('Download failed'));

    await expect(handleConvertVideo(mockData)).rejects.toThrow(
      'Download failed'
    );
    expect(mockRm).toHaveBeenCalled();
    expect(mockUploadDirectory).not.toHaveBeenCalled();
  });

  it('handles ffmpeg failure', async () => {
    const mockFfmpeg = {
      outputOptions: vi.fn().mockReturnThis(),
      output: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      run: vi.fn().mockImplementation(function (this: any) {
        const errorHandler = this.on.mock.calls.find(
          (call: any[]) => call[0] === 'error'
        )[1];
        errorHandler(new Error('Conversion failed'));
      }),
    };
    ffmpeg.mockReturnValue(mockFfmpeg);

    await expect(handleConvertVideo(mockData)).rejects.toThrow(
      'Conversion failed'
    );
    expect(mockRm).toHaveBeenCalled();
    expect(mockUploadDirectory).not.toHaveBeenCalled();
  });

  it('handles upload failure', async () => {
    mockUploadDirectory.mockRejectedValueOnce(new Error('Upload failed'));

    await expect(handleConvertVideo(mockData)).rejects.toThrow('Upload failed');
    expect(mockRm).toHaveBeenCalled();
  });
});
