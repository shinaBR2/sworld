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
vi.mock('@google-cloud/storage', () => {
  const mockFile = { save: vi.fn().mockResolvedValue(undefined) };
  const mockBucket = { file: vi.fn(() => mockFile) };
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
  (m as any).setFfmpegPath = vi.fn();
  return { default: m };
});
vi.mock('@ffmpeg-installer/ffmpeg', () => ({
  default: { path: '/fake/ffmpeg' },
}));

const createCtx = (videoId = 'v1', userId = 'u1', taskId = 't1') => ({
  validatedData: {
    body: {
      data: { videoId, userId },
      metadata: { id: 'e1', spanId: 's1', traceId: 'tr1' },
    },
    headers: { 'x-task-id': taskId },
  },
});

describe('repairFmp4Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(repackageToFmp4).mockResolvedValue({
      playlistContent: '#EXTM3U',
    } as any);
  });

  it('should successfully repair and finalize', async () => {
    await repairFmp4Handler(createCtx() as any);

    expect(repackageToFmp4).toHaveBeenCalledWith(
      { storagePath: 'videos/u1/v1' },
      expect.any(Object),
    );
    expect(finishVideoProcess).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 't1',
        videoId: 'v1',
        videoUpdates: expect.objectContaining({
          source: expect.stringContaining('playlist-fmp4.m3u8'),
          status: 'ready',
        }),
        notificationObject: expect.objectContaining({
          type: 'video-ready',
          entityId: 'v1',
        }),
      }),
    );
  });

  it('should return playable video URL', async () => {
    const result: any = await repairFmp4Handler(createCtx() as any);
    expect(result.success).toBe(true);
    expect(result.dataObject.playableVideoUrl).toContain('playlist-fmp4.m3u8');
  });

  it('should throw error when repair fails', async () => {
    vi.mocked(repackageToFmp4).mockRejectedValue(new Error('ffmpeg failed'));
    await expect(repairFmp4Handler(createCtx() as any)).rejects.toThrow(
      'fMP4 repair failed',
    );
  });
});
