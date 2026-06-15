import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processStream } from './processStream';
import type { ProcessStreamDeps } from './types';

const SOURCE = 'https://cdn.example.com/video/playlist.m3u8';
const STORAGE_PATH = 'videos/user-1/video-1';

const MANIFEST = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:4
#EXTINF:3.0,
seg-0.ts
#EXTINF:5.0,
/adjump/ad.ts
#EXTINF:3.0,
seg-1.ts
#EXT-X-ENDLIST`;

const okResponse = (over: Partial<Record<string, unknown>> = {}) => ({
  text: async () => '',
  body: new ReadableStream(),
  status: 200,
  statusText: 'OK',
  ...over,
});

const makeDeps = (
  overrides: {
    segmentBody?: () => ReadableStream | null;
    thumbnail?: () => Promise<string | undefined>;
  } = {},
): ProcessStreamDeps => {
  const segmentBody = overrides.segmentBody ?? (() => new ReadableStream());
  return {
    http: {
      fetch: vi.fn(async (url: string) => {
        if (url === SOURCE) {
          return okResponse({ text: async () => MANIFEST, body: null });
        }
        return okResponse({ body: segmentBody() });
      }),
    },
    storage: {
      uploadStream: vi.fn(async () => undefined),
      getDownloadUrl: vi.fn((p: string) => `https://storage.test/${p}`),
    },
    thumbnail: {
      generateFromSegment: vi.fn(
        overrides.thumbnail ?? (async () => 'https://storage.test/thumb.jpg'),
      ),
    },
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
};

const OPTIONS = { excludePatterns: [/\/adjump\//] };

describe('processStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads the playlist + each kept segment and returns the result', async () => {
    const deps = makeDeps();

    const result = await processStream(
      { sourceUrl: SOURCE, storagePath: STORAGE_PATH },
      OPTIONS,
      deps,
    );

    // playlist + 2 kept segments (ad stripped)
    expect(deps.storage.uploadStream).toHaveBeenCalledTimes(3);
    expect(deps.storage.uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({
        storagePath: `${STORAGE_PATH}/playlist.m3u8`,
        contentType: 'application/vnd.apple.mpegurl',
      }),
    );
    expect(deps.storage.uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({
        storagePath: `${STORAGE_PATH}/0.ts`,
        contentType: 'video/MP2T',
      }),
    );

    expect(deps.thumbnail.generateFromSegment).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://cdn.example.com/video/seg-0.ts',
        storagePath: STORAGE_PATH,
      }),
    );

    expect(result).toEqual({
      playlistUrl: `https://storage.test/${STORAGE_PATH}/playlist.m3u8`,
      duration: 6,
      thumbnailUrl: 'https://storage.test/thumb.jpg',
      segments: expect.objectContaining({
        included: expect.arrayContaining([
          expect.objectContaining({ name: '0.ts' }),
        ]),
      }),
    });
  });

  it('throws on an empty playlist (no kept segments)', async () => {
    const deps = makeDeps();
    (deps.http.fetch as ReturnType<typeof vi.fn>).mockImplementation(async () =>
      okResponse({ text: async () => '#EXTM3U\n#EXT-X-ENDLIST' }),
    );

    await expect(
      processStream(
        { sourceUrl: SOURCE, storagePath: STORAGE_PATH },
        OPTIONS,
        deps,
      ),
    ).rejects.toThrow('Empty HLS content');
  });

  it('tolerates a thumbnail failure (best-effort) and still completes', async () => {
    const deps = makeDeps({
      thumbnail: async () => {
        throw new Error('ffmpeg blew up');
      },
    });

    const result = await processStream(
      { sourceUrl: SOURCE, storagePath: STORAGE_PATH },
      OPTIONS,
      deps,
    );

    expect(result.thumbnailUrl).toBeUndefined();
    expect(deps.storage.uploadStream).toHaveBeenCalledTimes(3);
    expect(deps.logger.error).toHaveBeenCalled();
  });

  it('falls back to the default concurrency on a non-positive limit (no hang)', async () => {
    const deps = makeDeps();

    const result = await processStream(
      { sourceUrl: SOURCE, storagePath: STORAGE_PATH },
      { ...OPTIONS, concurrencyLimit: 0 },
      deps,
    );

    // playlist + 2 segments still uploaded — the loop terminated
    expect(deps.storage.uploadStream).toHaveBeenCalledTimes(3);
    expect(result.segments.included).toHaveLength(2);
  });

  it('fails the upload when a segment cannot be fetched', async () => {
    const deps = makeDeps({ segmentBody: () => null });

    await expect(
      processStream(
        { sourceUrl: SOURCE, storagePath: STORAGE_PATH },
        OPTIONS,
        deps,
      ),
    ).rejects.toThrow('Failed to stream file to storage');
  });
});
