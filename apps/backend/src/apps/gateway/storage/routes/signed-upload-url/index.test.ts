import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSignedUploadUrl } from '.';

const getSignedUploadUrlMock = vi.fn();
vi.mock('src/services/videos/helpers/gcp-cloud-storage', () => ({
  getSignedUploadUrl: (args: unknown) => getSignedUploadUrlMock(args),
}));

const makeContext = (overrides: Record<string, unknown> = {}) => ({
  validatedData: {
    site: 'watch',
    action: 'VIDEO_THUMBNAIL_UPLOAD',
    contentType: 'image/png',
    userId: 'user-1',
    id: 'video-9',
    ...overrides,
  },
});

describe('createSignedUploadUrl handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSignedUploadUrlMock.mockResolvedValue({
      uploadUrl: 'https://signed/put',
      publicUrl: 'https://public/url',
      expiresAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('signs the resolved object path and returns the payload', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test context shim
    const res = await createSignedUploadUrl(makeContext() as any);

    expect(getSignedUploadUrlMock).toHaveBeenCalledTimes(1);
    const { objectPath, contentType } = getSignedUploadUrlMock.mock.calls[0][0];
    expect(contentType).toBe('image/png');
    expect(objectPath).toMatch(/^videos\/user-1\/video-9\/[0-9a-f-]{36}\.png$/);

    expect(res.success).toBe(true);
    expect(res.dataObject).toMatchObject({
      uploadUrl: 'https://signed/put',
      publicUrl: 'https://public/url',
      objectPath,
      expiresAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('returns success:false for an unsupported (site, action) without signing', async () => {
    const res = await createSignedUploadUrl(
      // biome-ignore lint/suspicious/noExplicitAny: test context shim
      makeContext({ action: 'AUDIO_UPLOAD' }) as any,
    );
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/Unsupported upload/);
    expect(getSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it('returns success:false for a disallowed content type without signing', async () => {
    const res = await createSignedUploadUrl(
      makeContext({
        site: 'main',
        action: 'BOOK_UPLOAD',
        contentType: 'image/png',
        id: undefined,
        // biome-ignore lint/suspicious/noExplicitAny: test context shim
      }) as any,
    );
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/not allowed/);
    expect(getSignedUploadUrlMock).not.toHaveBeenCalled();
  });
});
