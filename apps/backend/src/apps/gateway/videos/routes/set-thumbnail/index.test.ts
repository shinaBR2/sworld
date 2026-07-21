import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setThumbnailAtTime } from '.';

const getVideoByIdMock = vi.fn();
vi.mock('src/services/hasura/queries/videos', () => ({
  getVideoById: (id: string) => getVideoByIdMock(id),
}));

const extractThumbnailAtTimeMock = vi.fn();
vi.mock('src/services/videos/helpers/thumbnail/extractAtTime', () => ({
  extractThumbnailAtTime: (args: unknown) => extractThumbnailAtTimeMock(args),
}));

const setVideoThumbnailMock = vi.fn();
vi.mock('src/services/hasura/mutations/videos/setThumbnail', () => ({
  setVideoThumbnail: (args: unknown) => setVideoThumbnailMock(args),
}));

const OWNER = '550e8400-e29b-41d4-a716-446655440001';
const VIDEO_ID = '550e8400-e29b-41d4-a716-446655440000';

const makeContext = (overrides: Record<string, unknown> = {}) => ({
  validatedData: {
    videoId: VIDEO_ID,
    atSeconds: 12.5,
    userId: OWNER,
    ...overrides,
  },
});

const makeVideo = (overrides: Record<string, unknown> = {}) => ({
  id: VIDEO_ID,
  source: 'https://cdn/hls/playlist.m3u8',
  status: 'ready',
  user_id: OWNER,
  duration: 60,
  thumbnailUrl: null,
  metadata: null,
  ...overrides,
});

describe('setThumbnailAtTime handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getVideoByIdMock.mockResolvedValue(makeVideo());
    extractThumbnailAtTimeMock.mockResolvedValue('https://cdn/thumb--1.jpg');
    setVideoThumbnailMock.mockResolvedValue({
      id: VIDEO_ID,
      thumbnailUrl: 'https://cdn/thumb--1.jpg',
    });
  });

  it('extracts the frame and persists the thumbnail for the owner (happy path)', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test context shim
    const res = await setThumbnailAtTime(makeContext() as any);

    expect(extractThumbnailAtTimeMock).toHaveBeenCalledTimes(1);
    expect(extractThumbnailAtTimeMock.mock.calls[0][0]).toMatchObject({
      source: 'https://cdn/hls/playlist.m3u8',
      atSeconds: 12.5,
      userId: OWNER,
      videoId: VIDEO_ID,
      duration: 60,
    });
    expect(setVideoThumbnailMock).toHaveBeenCalledWith({
      id: VIDEO_ID,
      thumbnailUrl: 'https://cdn/thumb--1.jpg',
    });
    expect(res.success).toBe(true);
    expect(res.dataObject).toEqual({
      thumbnailUrl: 'https://cdn/thumb--1.jpg',
    });
  });

  it('rejects a non-owner and writes nothing', async () => {
    const res = await setThumbnailAtTime(
      // biome-ignore lint/suspicious/noExplicitAny: test context shim
      makeContext({ userId: 'a-different-user' }) as any,
    );

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/permission/i);
    expect(extractThumbnailAtTimeMock).not.toHaveBeenCalled();
    expect(setVideoThumbnailMock).not.toHaveBeenCalled();
  });

  it('returns an error for an unknown videoId and writes nothing', async () => {
    getVideoByIdMock.mockResolvedValue(null);

    // biome-ignore lint/suspicious/noExplicitAny: test context shim
    const res = await setThumbnailAtTime(makeContext() as any);

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/not found/i);
    expect(extractThumbnailAtTimeMock).not.toHaveBeenCalled();
    expect(setVideoThumbnailMock).not.toHaveBeenCalled();
  });

  it('returns an error when the video has no stored source', async () => {
    getVideoByIdMock.mockResolvedValue(makeVideo({ source: null }));

    // biome-ignore lint/suspicious/noExplicitAny: test context shim
    const res = await setThumbnailAtTime(makeContext() as any);

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/no stored source/i);
    expect(extractThumbnailAtTimeMock).not.toHaveBeenCalled();
    expect(setVideoThumbnailMock).not.toHaveBeenCalled();
  });

  it('surfaces extractor failures as an error without writing', async () => {
    extractThumbnailAtTimeMock.mockRejectedValue(
      new Error('Empty HLS content'),
    );

    // biome-ignore lint/suspicious/noExplicitAny: test context shim
    const res = await setThumbnailAtTime(makeContext() as any);

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/Empty HLS content/);
    expect(setVideoThumbnailMock).not.toHaveBeenCalled();
  });

  it('falls back to a generic message when a non-Error is thrown', async () => {
    extractThumbnailAtTimeMock.mockRejectedValue('some string');

    // biome-ignore lint/suspicious/noExplicitAny: test context shim
    const res = await setThumbnailAtTime(makeContext() as any);

    expect(res.success).toBe(false);
    expect(res.message).toBe('Failed to set video thumbnail');
    expect(setVideoThumbnailMock).not.toHaveBeenCalled();
  });
});
