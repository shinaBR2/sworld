import type { Bucket } from '@google-cloud/storage';

/** Map an image content-type to a file extension for the stored object. */
const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

interface UploadThumbnailParams {
  /** Source image URL. */
  imageUrl: string;
  /** Optional referer for hotlink-protected hosts (sets both Referer and Origin). */
  referer?: string;
  /** Base storage path (e.g. `videos/<user>/<id>`); stored as `<storagePath>/thumbnail.<ext>`. */
  storagePath: string;
}

/**
 * Download an image (optionally with a referer for hotlink-protected hosts),
 * validate it is actually an image, upload it to the bucket as
 * `<storagePath>/thumbnail.<ext>`, and return its public URL.
 *
 * The image is RE-HOSTED in our bucket on purpose — we never point
 * `videos.thumbnailUrl` at a third-party URL, which may be referer-gated, rotate,
 * or expire (the same reason the stream sources need re-hosting).
 */
const uploadThumbnailFromUrl = async (
  bucket: Bucket,
  { imageUrl, referer, storagePath }: UploadThumbnailParams,
): Promise<string> => {
  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
  };
  if (referer) {
    // Parse as a URL so Origin is a real origin (scheme://host[:port]) and the
    // Referer keeps any path — string surgery mangles referers that have a path.
    try {
      const url = new URL(referer);
      headers.Referer = url.href;
      headers.Origin = url.origin;
    } catch {
      // Not a parseable URL — pass it through as the Referer as-is.
      headers.Referer = referer;
    }
  }

  const response = await fetch(imageUrl, { headers });
  if (!response.ok) {
    throw new Error(
      `Thumbnail fetch failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = (response.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  if (!contentType.startsWith('image/')) {
    throw new Error(
      `Thumbnail source is not an image (content-type: ${contentType || 'unknown'})`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 100) {
    throw new Error(`Thumbnail too small to be valid (${buffer.length} bytes)`);
  }

  const ext = EXT_BY_CONTENT_TYPE[contentType] ?? 'jpg';
  const destination = `${storagePath}/thumbnail.${ext}`;
  await bucket.file(destination).save(buffer, {
    contentType,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });

  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
};

export { uploadThumbnailFromUrl };
