import { beforeEach, describe, expect, it, vi } from 'vitest';
import { repackageToFmp4 } from './repackageToFmp4';
import type { Fmp4Artifacts, RepackageDeps, RepackageSource } from './types';
import { Readable } from 'node:stream';

const OUTPUT_PATH = 'videos/user-1/video-1/v2';
const SOURCE: RepackageSource = {
  kind: 'hls-url',
  url: 'https://storage.test/videos/user-1/video-1/playlist.m3u8',
};

const FMP4_PLAYLIST = `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-MAP:URI="init.mp4"
#EXTINF:4.0,
0.m4s
#EXTINF:4.0,
1.m4s
#EXT-X-ENDLIST`;

const makeArtifacts = (segmentCount = 2): Fmp4Artifacts => ({
  init: { name: 'init.mp4', stream: Readable.from(['init-bytes']) },
  segments: Array.from({ length: segmentCount }, (_, i) => ({
    name: `${i}.m4s`,
    stream: Readable.from([`seg-${i}-bytes`]),
  })),
  playlistContent: FMP4_PLAYLIST,
});

const makeDeps = (
  overrides: {
    artifacts?: Fmp4Artifacts;
    cleanup?: () => Promise<void>;
    uploadStream?: () => Promise<unknown>;
  } = {},
): { deps: RepackageDeps; cleanup: ReturnType<typeof vi.fn> } => {
  const cleanup = vi.fn(overrides.cleanup ?? (async () => undefined));
  const deps: RepackageDeps = {
    storage: {
      uploadStream: vi.fn(overrides.uploadStream ?? (async () => undefined)),
      getDownloadUrl: vi.fn((p: string) => `https://storage.test/${p}`),
    },
    repackage: {
      repackageToFmp4: vi.fn(async () => ({
        artifacts: overrides.artifacts ?? makeArtifacts(),
        cleanup,
      })),
    },
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
  return { deps, cleanup };
};

const run = (deps: RepackageDeps) =>
  repackageToFmp4({ source: SOURCE, outputStoragePath: OUTPUT_PATH }, deps);

describe('repackageToFmp4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('feeds the source through to the repackage port', async () => {
    const { deps } = makeDeps();

    await run(deps);

    expect(deps.repackage.repackageToFmp4).toHaveBeenCalledWith(SOURCE);
  });

  it('uploads init + each .m4s + the manifest, all under the versioned dir', async () => {
    const { deps } = makeDeps();

    const result = await run(deps);

    // 1 init + 2 segments + 1 manifest = 4 uploads, every one under v2/.
    expect(deps.storage.uploadStream).toHaveBeenCalledTimes(4);
    expect(deps.storage.uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({
        storagePath: `${OUTPUT_PATH}/init.mp4`,
        contentType: 'video/mp4',
      }),
    );
    expect(deps.storage.uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({
        storagePath: `${OUTPUT_PATH}/0.m4s`,
        contentType: 'video/iso.segment',
      }),
    );
    expect(deps.storage.uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({
        storagePath: `${OUTPUT_PATH}/playlist.m3u8`,
        contentType: 'application/vnd.apple.mpegurl',
      }),
    );

    expect(result).toEqual({
      initName: 'init.mp4',
      segmentNames: ['0.m4s', '1.m4s'],
      manifestStoragePath: `${OUTPUT_PATH}/playlist.m3u8`,
    });
  });

  it('uploads the manifest last, after every segment', async () => {
    const { deps } = makeDeps();

    await run(deps);

    const calls = (
      deps.storage.uploadStream as ReturnType<typeof vi.fn>
    ).mock.calls.map(([arg]) => (arg as { storagePath: string }).storagePath);
    const manifestIdx = calls.findIndex((p) => p.endsWith('playlist.m3u8'));
    expect(manifestIdx).toBe(calls.length - 1);
  });

  it('always cleans up temp resources on success', async () => {
    const { deps, cleanup } = makeDeps();

    await run(deps);

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('throws and still cleans up when no segments were produced', async () => {
    const { deps, cleanup } = makeDeps({ artifacts: makeArtifacts(0) });

    await expect(run(deps)).rejects.toThrow('Repackage produced no segments');
    expect(deps.storage.uploadStream).not.toHaveBeenCalled();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('swallows + warns a cleanup failure on the success path', async () => {
    const { deps } = makeDeps({
      cleanup: async () => {
        throw new Error('rm -rf failed');
      },
    });

    const result = await run(deps);

    expect(result.initName).toBe('init.mp4');
    expect(deps.logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ outputStoragePath: OUTPUT_PATH }),
      'fMP4 repackage cleanup failed',
    );
  });

  it('a cleanup failure never masks the primary error', async () => {
    const { deps } = makeDeps({
      uploadStream: async () => {
        throw new Error('GCS down');
      },
      cleanup: async () => {
        throw new Error('rm -rf failed');
      },
    });

    await expect(run(deps)).rejects.toThrow('Failed to upload fMP4 artifacts');
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('wraps upload failures and still cleans up', async () => {
    const { deps, cleanup } = makeDeps({
      uploadStream: async () => {
        throw new Error('GCS down');
      },
    });

    await expect(run(deps)).rejects.toThrow('Failed to upload fMP4 artifacts');
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
