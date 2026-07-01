import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import {
  cleanupDirectory,
  createDirectory,
  downloadFile,
  generateTempDir,
} from '../file';
import { takeScreenshotAtTime } from '../ffmpeg';
import { getDownloadUrl, uploadFile } from '../gcp-cloud-storage';
import { extractThumbnailAtTime, findCoveringSegment } from './extractAtTime';

vi.mock('src/utils/logger', () => ({
  getCurrentLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('src/utils/fetch', () => ({
  fetchWithError: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue(Buffer.from('data')),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../file', () => ({
  createDirectory: vi.fn(),
  downloadFile: vi.fn(),
  generateTempDir: vi.fn(),
  cleanupDirectory: vi.fn(),
}));

vi.mock('../ffmpeg', () => ({
  takeScreenshotAtTime: vi.fn(),
}));

vi.mock('../gcp-cloud-storage', () => ({
  uploadFile: vi.fn(),
  getDownloadUrl: vi.fn(),
}));

import { fetchWithError } from 'src/utils/fetch';

const PLAYLIST_URL =
  'https://storage.googleapis.com/bucket/videos/u1/v1/playlist.m3u8';

// Three segments: 8s + 5s + 4s. Cumulative starts: 0, 8, 13.
const PLAYLIST_CONTENT = `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:9
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-MAP:URI="init.mp4"
#EXTINF:8.0,
0.m4s
#EXTINF:5.0,
1.m4s
#EXTINF:4.0,
2.m4s
#EXT-X-ENDLIST
`;

const mockPlaylistResponse = (content: string) => {
  vi.mocked(fetchWithError).mockResolvedValue({
    text: async () => content,
  } as Response);
};

describe('findCoveringSegment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlaylistResponse(PLAYLIST_CONTENT);
  });

  it('resolves the segment covering an arbitrary timestamp with the in-segment offset', async () => {
    // t=10s falls in segment 1 (starts at 8s) → offset 2s.
    const result = await findCoveringSegment({
      playlistUrl: PLAYLIST_URL,
      atSeconds: 10,
    });

    expect(result.segmentUrl).toBe(
      'https://storage.googleapis.com/bucket/videos/u1/v1/1.m4s',
    );
    expect(result.initUrl).toBe(
      'https://storage.googleapis.com/bucket/videos/u1/v1/init.mp4',
    );
    expect(result.offsetInSegment).toBeCloseTo(2);
  });

  it('resolves the first segment for t=0', async () => {
    const result = await findCoveringSegment({
      playlistUrl: PLAYLIST_URL,
      atSeconds: 0,
    });

    expect(result.segmentUrl).toBe(
      'https://storage.googleapis.com/bucket/videos/u1/v1/0.m4s',
    );
    expect(result.offsetInSegment).toBeCloseTo(0);
  });

  it('falls back to the last segment when the timestamp is past the end', async () => {
    // Total duration is 17s; ask for 100s.
    const result = await findCoveringSegment({
      playlistUrl: PLAYLIST_URL,
      atSeconds: 100,
    });

    expect(result.segmentUrl).toBe(
      'https://storage.googleapis.com/bucket/videos/u1/v1/2.m4s',
    );
    // Offset into the last segment (starts at 13s) is clamped from 100-13.
    expect(result.offsetInSegment).toBeCloseTo(87);
  });

  it('throws on an empty playlist', async () => {
    mockPlaylistResponse('#EXTM3U\n#EXT-X-ENDLIST\n');

    await expect(
      findCoveringSegment({ playlistUrl: PLAYLIST_URL, atSeconds: 1 }),
    ).rejects.toThrow(CustomError);
  });

  it('throws when the covering segment is missing its init (#EXT-X-MAP)', async () => {
    // A playlist with segments but NO #EXT-X-MAP → the covering segment's
    // `map.uri` is undefined, which is not decodable on its own.
    mockPlaylistResponse(`#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:9
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:8.0,
0.m4s
#EXTINF:5.0,
1.m4s
#EXT-X-ENDLIST
`);

    // t=10s falls inside segment 1 (the covering branch), which lacks an init.
    await expect(
      findCoveringSegment({ playlistUrl: PLAYLIST_URL, atSeconds: 10 }),
    ).rejects.toMatchObject({
      errorCode: VIDEO_ERRORS.INVALID_VIDEO_FORMAT,
      message: 'HLS segment missing init (#EXT-X-MAP)',
    });
  });

  it('throws when the last (fallback) segment is missing its init (#EXT-X-MAP)', async () => {
    // No #EXT-X-MAP, and `atSeconds` past the end → falls to the last segment,
    // which also lacks an init.
    mockPlaylistResponse(`#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:9
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:8.0,
0.m4s
#EXTINF:5.0,
1.m4s
#EXT-X-ENDLIST
`);

    await expect(
      findCoveringSegment({ playlistUrl: PLAYLIST_URL, atSeconds: 100 }),
    ).rejects.toMatchObject({
      errorCode: VIDEO_ERRORS.INVALID_VIDEO_FORMAT,
      message: 'HLS segment missing init (#EXT-X-MAP)',
    });
  });
});

describe('extractThumbnailAtTime', () => {
  const workingDir = '/tmp/work';

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlaylistResponse(PLAYLIST_CONTENT);
    vi.mocked(generateTempDir).mockReturnValue(workingDir);
    vi.mocked(createDirectory).mockResolvedValue(undefined);
    vi.mocked(downloadFile).mockResolvedValue(undefined);
    vi.mocked(cleanupDirectory).mockResolvedValue(undefined);
    vi.mocked(takeScreenshotAtTime).mockResolvedValue(undefined);
    vi.mocked(uploadFile).mockResolvedValue(undefined);
    vi.mocked(getDownloadUrl).mockImplementation(
      (p: string) => `https://storage.googleapis.com/bucket/${p}`,
    );
  });

  it('downloads init + covering segment, screenshots at the absolute time, uploads, and returns the public URL', async () => {
    const url = await extractThumbnailAtTime({
      source: PLAYLIST_URL,
      atSeconds: 10,
      userId: 'u1',
      videoId: 'v1',
    });

    // init.mp4 and the covering segment (1.m4s) are both downloaded.
    expect(downloadFile).toHaveBeenCalledWith(
      'https://storage.googleapis.com/bucket/videos/u1/v1/init.mp4',
      expect.stringContaining('init.mp4'),
      undefined,
    );
    expect(downloadFile).toHaveBeenCalledWith(
      'https://storage.googleapis.com/bucket/videos/u1/v1/1.m4s',
      expect.stringContaining('segment.m4s'),
      undefined,
    );

    // Seeks by the ABSOLUTE media time (10s), NOT the in-segment offset
    // (10 - 8 = 2s). Concatenating init.mp4 + the .m4s does not rebase
    // timestamps, so the absolute time is what lands on the requested frame.
    expect(takeScreenshotAtTime).toHaveBeenCalledWith(
      expect.stringContaining('playable.mp4'),
      workingDir,
      expect.stringMatching(/^thumbnail--\d+\.jpg$/),
      expect.closeTo(10, 3),
    );

    // Uploads to the required storage path and returns its public URL.
    expect(uploadFile).toHaveBeenCalledWith(
      expect.stringMatching(/^\/tmp\/work\/thumbnail--\d+\.jpg$/),
      expect.stringMatching(/^videos\/u1\/v1\/thumbnail--\d+\.jpg$/),
      expect.objectContaining({ resumable: false }),
    );
    expect(url).toMatch(
      /^https:\/\/storage\.googleapis\.com\/bucket\/videos\/u1\/v1\/thumbnail--\d+\.jpg$/,
    );

    expect(cleanupDirectory).toHaveBeenCalledWith(workingDir);
  });

  it('clamps a negative atSeconds to 0 (first segment)', async () => {
    await extractThumbnailAtTime({
      source: PLAYLIST_URL,
      atSeconds: -50,
      userId: 'u1',
      videoId: 'v1',
    });

    // Clamped to 0 → first segment; absolute seek is 0.
    expect(downloadFile).toHaveBeenCalledWith(
      'https://storage.googleapis.com/bucket/videos/u1/v1/0.m4s',
      expect.stringContaining('segment.m4s'),
      undefined,
    );
    expect(takeScreenshotAtTime).toHaveBeenCalledWith(
      expect.any(String),
      workingDir,
      expect.any(String),
      expect.closeTo(0, 3),
    );
  });

  it('clamps atSeconds below the known duration', async () => {
    // duration=17 → clamp to 16 → falls in last segment (starts 13s), which is
    // the in-segment offset of 3s but an ABSOLUTE seek time of 16s.
    await extractThumbnailAtTime({
      source: PLAYLIST_URL,
      atSeconds: 9999,
      userId: 'u1',
      videoId: 'v1',
      duration: 17,
    });

    expect(downloadFile).toHaveBeenCalledWith(
      'https://storage.googleapis.com/bucket/videos/u1/v1/2.m4s',
      expect.stringContaining('segment.m4s'),
      undefined,
    );
    // Seeks by the clamped ABSOLUTE time (16s), NOT the in-segment offset (3s).
    // A regression to `offsetInSegment` would seek 3s and fail here.
    expect(takeScreenshotAtTime).toHaveBeenCalledWith(
      expect.any(String),
      workingDir,
      expect.any(String),
      expect.closeTo(16, 3),
    );
  });

  it('cleans up and wraps errors as CustomError', async () => {
    vi.mocked(takeScreenshotAtTime).mockRejectedValue(new Error('ffmpeg boom'));

    await expect(
      extractThumbnailAtTime({
        source: PLAYLIST_URL,
        atSeconds: 10,
        userId: 'u1',
        videoId: 'v1',
      }),
    ).rejects.toBeInstanceOf(CustomError);

    expect(cleanupDirectory).toHaveBeenCalledWith(workingDir);
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('re-throws a CustomError unchanged instead of wrapping it', async () => {
    // An inner dependency rejects with a CustomError; the outer catch must
    // re-throw that same instance rather than wrapping it in the generic
    // 'Failed to extract thumbnail at time' error.
    const innerError = CustomError.medium('inner failure', {
      errorCode: VIDEO_ERRORS.INVALID_VIDEO_FORMAT,
      source: 'test',
    });
    vi.mocked(downloadFile).mockRejectedValue(innerError);

    await expect(
      extractThumbnailAtTime({
        source: PLAYLIST_URL,
        atSeconds: 10,
        userId: 'u1',
        videoId: 'v1',
      }),
    ).rejects.toBe(innerError);

    expect(cleanupDirectory).toHaveBeenCalledWith(workingDir);
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('forwards custom request headers to downloads', async () => {
    await extractThumbnailAtTime({
      source: PLAYLIST_URL,
      atSeconds: 10,
      userId: 'u1',
      videoId: 'v1',
      customRequestHeaders: { Referer: 'https://example.com' },
    });

    expect(downloadFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      { Referer: 'https://example.com' },
    );
  });
});
