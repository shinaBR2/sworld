import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadThumbnailFromUrl } from '.';

const makeBucket = () => {
  const save = vi.fn().mockResolvedValue(undefined);
  const file = vi.fn().mockReturnValue({ save });
  return { bucket: { name: 'test-bucket', file } as never, file, save };
};

const imageResponse = (contentType: string, bytes = 4000) =>
  ({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {
      get: (k: string) => (k === 'content-type' ? contentType : null),
    },
    arrayBuffer: async () => new Uint8Array(bytes).buffer,
  }) as unknown as Response;

describe('uploadThumbnailFromUrl', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('downloads, uploads to <storagePath>/thumbnail.jpg, and returns the public URL', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(imageResponse('image/jpeg'));
    const { bucket, file, save } = makeBucket();

    const url = await uploadThumbnailFromUrl(bucket, {
      imageUrl: 'https://host/img.jpg',
      storagePath: 'videos/u/v',
    });

    expect(url).toBe(
      'https://storage.googleapis.com/test-bucket/videos/u/v/thumbnail.jpg',
    );
    expect(file).toHaveBeenCalledWith('videos/u/v/thumbnail.jpg');
    expect(save).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        contentType: 'image/jpeg',
        metadata: { cacheControl: 'public, max-age=31536000' },
      }),
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('derives the extension from the content-type (png)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(imageResponse('image/png'));
    const { bucket, file } = makeBucket();
    const url = await uploadThumbnailFromUrl(bucket, {
      imageUrl: 'https://host/x',
      storagePath: 'videos/u/v',
    });
    expect(file).toHaveBeenCalledWith('videos/u/v/thumbnail.png');
    expect(url.endsWith('/thumbnail.png')).toBe(true);
  });

  it('sets Referer and Origin when a referer is given', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(imageResponse('image/jpeg'));
    const { bucket } = makeBucket();
    await uploadThumbnailFromUrl(bucket, {
      imageUrl: 'https://host/x.jpg',
      referer: 'https://site.example',
      storagePath: 'videos/u/v',
    });
    const headers = (fetchMock.mock.calls[0][1] as RequestInit)
      .headers as Record<string, string>;
    expect(headers.Referer).toBe('https://site.example/');
    expect(headers.Origin).toBe('https://site.example');
  });

  it('keeps the referer path but sets Origin to the real origin', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(imageResponse('image/jpeg'));
    const { bucket } = makeBucket();
    await uploadThumbnailFromUrl(bucket, {
      imageUrl: 'https://host/x.jpg',
      referer: 'https://site.example/watch/123',
      storagePath: 'videos/u/v',
    });
    const headers = (fetchMock.mock.calls[0][1] as RequestInit)
      .headers as Record<string, string>;
    expect(headers.Referer).toBe('https://site.example/watch/123');
    expect(headers.Origin).toBe('https://site.example');
  });

  it('falls back to Referer-as-is when the referer is not a valid URL', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(imageResponse('image/jpeg'));
    const { bucket } = makeBucket();
    await uploadThumbnailFromUrl(bucket, {
      imageUrl: 'https://host/x.jpg',
      referer: 'not-a-url',
      storagePath: 'videos/u/v',
    });
    const headers = (fetchMock.mock.calls[0][1] as RequestInit)
      .headers as Record<string, string>;
    expect(headers.Referer).toBe('not-a-url');
    expect(headers.Origin).toBeUndefined();
  });

  it('falls back to a .jpg extension for an unrecognized image type', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(imageResponse('image/bmp'));
    const { bucket, file } = makeBucket();
    await uploadThumbnailFromUrl(bucket, {
      imageUrl: 'https://host/x',
      storagePath: 'videos/u/v',
    });
    expect(file).toHaveBeenCalledWith('videos/u/v/thumbnail.jpg');
  });

  it('throws when the downloaded image is too small', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      imageResponse('image/jpeg', 50),
    );
    const { bucket, save } = makeBucket();
    await expect(
      uploadThumbnailFromUrl(bucket, {
        imageUrl: 'https://host/x.jpg',
        storagePath: 'videos/u/v',
      }),
    ).rejects.toThrow('too small');
    expect(save).not.toHaveBeenCalled();
  });

  it('throws on a non-image content-type', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(imageResponse('text/html'));
    const { bucket, save } = makeBucket();
    await expect(
      uploadThumbnailFromUrl(bucket, {
        imageUrl: 'https://host/x',
        storagePath: 'videos/u/v',
      }),
    ).rejects.toThrow('not an image');
    expect(save).not.toHaveBeenCalled();
  });

  it('throws when the fetch is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    } as unknown as Response);
    const { bucket, save } = makeBucket();
    await expect(
      uploadThumbnailFromUrl(bucket, {
        imageUrl: 'https://host/x',
        storagePath: 'videos/u/v',
      }),
    ).rejects.toThrow('Thumbnail fetch failed: 403');
    expect(save).not.toHaveBeenCalled();
  });
});
