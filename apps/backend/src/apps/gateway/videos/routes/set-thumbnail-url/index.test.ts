import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setThumbnailUrl } from '.';

const getVideoByIdMock = vi.fn();
vi.mock('src/services/hasura/queries/videos', () => ({
  getVideoById: (id: string) => getVideoByIdMock(id),
}));

const setVideoThumbnailMock = vi.fn();
vi.mock('src/services/hasura/mutations/videos/setThumbnail', () => ({
  setVideoThumbnail: (args: unknown) => setVideoThumbnailMock(args),
}));

const getDownloadUrlMock = vi.fn();
vi.mock('src/services/videos/helpers/gcp-cloud-storage', () => ({
  getDownloadUrl: (objectPath: string) => getDownloadUrlMock(objectPath),
}));

const OWNER = '550e8400-e29b-41d4-a716-446655440001';
const VIDEO_ID = '550e8400-e29b-41d4-a716-446655440000';
const OBJECT_PATH = `videos/${OWNER}/${VIDEO_ID}/abc-123.jpg`;
const DOWNLOAD_URL = `https://storage.googleapis.com/bucket/${OBJECT_PATH}`;

const makeContext = (overrides: Record<string, unknown> = {}) => ({
  validatedData: {
    videoId: VIDEO_ID,
    objectPath: OBJECT_PATH,
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

describe('setThumbnailUrl handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getVideoByIdMock.mockResolvedValue(makeVideo());
    getDownloadUrlMock.mockReturnValue(DOWNLOAD_URL);
    setVideoThumbnailMock.mockResolvedValue({
      id: VIDEO_ID,
      thumbnailUrl: DOWNLOAD_URL,
    });
  });

  it('persists the client-uploaded thumbnail for the owner (happy path)', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test context shim
    const res = await setThumbnailUrl(makeContext() as any);

    expect(getDownloadUrlMock).toHaveBeenCalledWith(OBJECT_PATH);
    expect(setVideoThumbnailMock).toHaveBeenCalledWith({
      id: VIDEO_ID,
      thumbnailUrl: DOWNLOAD_URL,
    });
    expect(res.success).toBe(true);
    expect(res.dataObject).toEqual({ thumbnailUrl: DOWNLOAD_URL });
  });

  it('rejects a non-owner and writes nothing', async () => {
    const res = await setThumbnailUrl(
      // biome-ignore lint/suspicious/noExplicitAny: test context shim
      makeContext({ userId: 'a-different-user' }) as any,
    );

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/permission/i);
    expect(getDownloadUrlMock).not.toHaveBeenCalled();
    expect(setVideoThumbnailMock).not.toHaveBeenCalled();
  });

  it('returns an error for an unknown videoId and writes nothing', async () => {
    getVideoByIdMock.mockResolvedValue(null);

    // biome-ignore lint/suspicious/noExplicitAny: test context shim
    const res = await setThumbnailUrl(makeContext() as any);

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/not found/i);
    expect(getDownloadUrlMock).not.toHaveBeenCalled();
    expect(setVideoThumbnailMock).not.toHaveBeenCalled();
  });

  it('rejects an objectPath outside videos/{userId}/{videoId}/ and writes nothing', async () => {
    const res = await setThumbnailUrl(
      makeContext({
        objectPath: `videos/${OWNER}/some-other-video/abc.jpg`,
        // biome-ignore lint/suspicious/noExplicitAny: test context shim
      }) as any,
    );

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/invalid thumbnail path/i);
    expect(getDownloadUrlMock).not.toHaveBeenCalled();
    expect(setVideoThumbnailMock).not.toHaveBeenCalled();
  });

  it("rejects an objectPath under another user's prefix and writes nothing", async () => {
    const res = await setThumbnailUrl(
      makeContext({
        objectPath: `videos/another-user/${VIDEO_ID}/abc.jpg`,
        // biome-ignore lint/suspicious/noExplicitAny: test context shim
      }) as any,
    );

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/invalid thumbnail path/i);
    expect(setVideoThumbnailMock).not.toHaveBeenCalled();
  });
});
