import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { repackageToFmp4 } from 'src/services/videos/processing/repackageToFmp4';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { repairFmp4Handler } from './index';

vi.mock('src/services/videos/processing/repackageToFmp4', () => ({
  repackageToFmp4: vi.fn(),
}));
vi.mock('src/services/hasura/mutations/videos/finalize', () => ({
  finishVideoProcess: vi.fn(),
}));
vi.mock('src/services/videos/helpers/gcp-cloud-storage', () => ({
  getDownloadUrl: vi.fn(
    (path: string) => `https://storage.googleapis.com/test-bucket/${path}`,
  ),
}));
vi.mock('src/utils/schema', () => ({
  AppResponse: vi.fn((s: boolean, m: string, d: any) => ({
    success: s,
    message: m,
    dataObject: d,
  })),
}));
vi.mock('src/utils/logger', () => ({
  getCurrentLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));
vi.mock('src/utils/custom-error', () => ({
  CustomError: { critical: vi.fn((msg: string) => new Error(msg)) },
}));
vi.mock('src/utils/envConfig', () => ({
  envConfig: { storageBucket: 'test-bucket' },
}));
// Stored objects the handler lists to decide the reprocess source + version.
// Default: a stored `.ts` layout (→ hls-ts remux). Tests override via
// setStoredFiles before invoking the handler.
let storedFiles: Array<{ name: string; metadata: { size: string } }> = [];
const setStoredFiles = (files: typeof storedFiles) => {
  storedFiles = files;
};
vi.mock('@google-cloud/storage', () => {
  const mockFile = { save: vi.fn().mockResolvedValue(undefined) };
  const mockBucket = {
    file: vi.fn(() => mockFile),
    getFiles: vi.fn(async () => [storedFiles]),
  };
  return {
    Storage: vi.fn().mockImplementation(function (this: any) {
      this.bucket = vi.fn(() => mockBucket);
    }),
  };
});
vi.mock('fluent-ffmpeg', () => {
  const m = vi.fn(() => ({
    outputOptions: vi.fn().mockReturnThis(),
    format: vi.fn().mockReturnThis(),
    output: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    run: vi.fn(),
  }));
  return { default: m };
});

const createCtx = (videoId = 'v1', userId = 'u1', taskId = 't1') => ({
  validatedData: {
    body: {
      data: { videoId, userId },
      metadata: { id: 'e1', spanId: 's1', traceId: 'tr1' },
    },
    headers: { 'x-task-id': taskId },
  },
});

// A stored `.ts` layout — planReprocessSource picks the hls-ts remux.
const TS_LAYOUT = [
  { name: 'videos/u1/v1/playlist.m3u8', metadata: { size: '300' } },
  { name: 'videos/u1/v1/0.ts', metadata: { size: '900000' } },
];
// A stored fMP4 layout with an empty first segment — the Infinix recovery case.
const FMP4_LAYOUT = [
  { name: 'videos/u1/v1/init.mp4', metadata: { size: '1533135' } },
  { name: 'videos/u1/v1/0.m4s', metadata: { size: '24' } },
  { name: 'videos/u1/v1/1.m4s', metadata: { size: '780340' } },
  { name: 'videos/u1/v1/playlist.m3u8', metadata: { size: '330' } },
];

describe('repairFmp4Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setStoredFiles(TS_LAYOUT);
    vi.mocked(repackageToFmp4).mockResolvedValue({
      initName: 'init.mp4',
      segmentNames: ['0.m4s', '1.m4s'],
      manifestStoragePath: 'videos/u1/v1/v1/playlist.m3u8',
    });
  });

  it('reprocesses a stored .ts rendition into a fresh versioned dir', async () => {
    await repairFmp4Handler(createCtx() as any);

    expect(repackageToFmp4).toHaveBeenCalledWith(
      {
        source: {
          kind: 'hls-url',
          url: expect.stringContaining('videos/u1/v1/playlist.m3u8'),
        },
        outputStoragePath: 'videos/u1/v1/v1',
      },
      expect.any(Object),
    );
    expect(finishVideoProcess).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 't1',
        videoId: 'v1',
        videoUpdates: expect.objectContaining({
          source: expect.stringContaining('videos/u1/v1/v1/playlist.m3u8'),
          status: 'ready',
        }),
        notificationObject: expect.objectContaining({
          type: 'video-ready',
          entityId: 'v1',
        }),
      }),
    );
  });

  it('recovers from stored fMP4 parts when no .ts is present', async () => {
    setStoredFiles(FMP4_LAYOUT);

    await repairFmp4Handler(createCtx() as any);

    expect(repackageToFmp4).toHaveBeenCalledWith(
      expect.objectContaining({
        source: {
          kind: 'fmp4-parts',
          partUrls: [
            expect.stringContaining('videos/u1/v1/init.mp4'),
            expect.stringContaining('videos/u1/v1/1.m4s'),
          ],
        },
        outputStoragePath: 'videos/u1/v1/v1',
      }),
      expect.any(Object),
    );
  });

  it('bumps to the next version when a v1 rendition already exists', async () => {
    setStoredFiles([
      ...TS_LAYOUT,
      { name: 'videos/u1/v1/v1/init.mp4', metadata: { size: '1368' } },
      { name: 'videos/u1/v1/v1/playlist.m3u8', metadata: { size: '300' } },
    ]);

    await repairFmp4Handler(createCtx() as any);

    expect(repackageToFmp4).toHaveBeenCalledWith(
      expect.objectContaining({ outputStoragePath: 'videos/u1/v1/v2' }),
      expect.any(Object),
    );
  });

  it('returns the versioned playable video URL', async () => {
    const result: any = await repairFmp4Handler(createCtx() as any);
    expect(result.success).toBe(true);
    expect(result.dataObject.playableVideoUrl).toContain(
      'videos/u1/v1/v1/playlist.m3u8',
    );
  });

  it('should throw error when repair fails', async () => {
    vi.mocked(repackageToFmp4).mockRejectedValue(new Error('ffmpeg failed'));
    await expect(repairFmp4Handler(createCtx() as any)).rejects.toThrow(
      'fMP4 repair failed',
    );
  });
});
