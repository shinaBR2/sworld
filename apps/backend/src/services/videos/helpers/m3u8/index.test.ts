import { processStream } from 'src/services/videos/processing/processStream';
import { fetchWithError } from 'src/utils/fetch';
import { systemConfig } from 'src/utils/systemConfig';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { videoConfig } from '../../config';
import { getDownloadUrl, streamFile } from '../gcp-cloud-storage';
import { processThumbnail } from '../thumbnail';
import { streamM3U8 } from './index';

// The adapter wires backend impls into the core; mock both.
vi.mock('src/services/videos/processing/processStream', () => ({
  processStream: vi.fn(),
}));
vi.mock('src/utils/fetch', () => ({ fetchWithError: vi.fn() }));
vi.mock('../gcp-cloud-storage', () => ({
  streamFile: vi.fn(),
  getDownloadUrl: vi.fn((p: string) => `https://storage.test/${p}`),
}));
vi.mock('../thumbnail', () => ({ processThumbnail: vi.fn() }));
vi.mock('src/utils/logger', () => ({
  getCurrentLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('streamM3U8 (backend adapter)', () => {
  const url = 'https://example.com/video.m3u8';
  const storagePath = 'videos/user-1/video-1';
  const fakeResult = {
    playlistUrl: 'https://storage.test/playlist.m3u8',
    duration: 120,
    thumbnailUrl: 'https://storage.test/thumb.jpg',
    segments: { included: [], excluded: [] },
    modifiedContent: '#EXTM3U',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(processStream).mockResolvedValue(fakeResult);
  });

  it('calls the core with mapped input/options and returns its result', async () => {
    const result = await streamM3U8(url, storagePath, {
      excludePatterns: [/\/ad\//],
      customRequestHeaders: { Referer: 'https://example.com/' },
    });

    expect(processStream).toHaveBeenCalledWith(
      { sourceUrl: url, storagePath },
      {
        excludePatterns: [/\/ad\//],
        concurrencyLimit: videoConfig.defaultConcurrencyLimit,
        customRequestHeaders: { Referer: 'https://example.com/' },
      },
      expect.any(Object),
    );
    expect(result).toBe(fakeResult);
  });

  it('wires backend deps onto the core ports', async () => {
    await streamM3U8(url, storagePath, {});
    const deps = vi.mocked(processStream).mock.calls[0][2];

    deps.storage.getDownloadUrl('a/b');
    expect(getDownloadUrl).toHaveBeenCalledWith('a/b');

    const stream = { pipe: vi.fn() } as never;
    await deps.storage.uploadStream({
      stream,
      storagePath: 'a/0.ts',
      contentType: 'video/MP2T',
    });
    expect(streamFile).toHaveBeenCalledWith({
      stream,
      storagePath: 'a/0.ts',
      options: { contentType: 'video/MP2T' },
    });

    await deps.http.fetch('https://seg', { headers: { a: '1' } });
    expect(fetchWithError).toHaveBeenCalledWith('https://seg', {
      headers: { a: '1' },
      timeout: systemConfig.defaultExternalRequestTimeout,
    });

    vi.mocked(processThumbnail).mockResolvedValueOnce('a/thumb.jpg');
    const thumbUrl = await deps.thumbnail.generateFromSegment({
      url: 'https://seg',
      duration: 3,
      storagePath: 'a',
    });
    expect(processThumbnail).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://seg', isSegment: true }),
    );
    expect(thumbUrl).toBe('https://storage.test/a/thumb.jpg');
  });
});
