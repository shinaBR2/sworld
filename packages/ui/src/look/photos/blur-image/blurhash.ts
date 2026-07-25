import { decode } from 'blurhash';

// A blur-hash decodes to a tiny pixel grid; 32x32 is enough for a soft
// placeholder that scales up (via background-size: cover) without visible
// blocks. Kept small so decoding the visible window stays cheap.
const BLURHASH_SIZE = 32;

// Turn a blur-hash string into a data URI usable as a CSS background-image.
// Returns undefined when the hash is empty, invalid, or the canvas is
// unavailable (e.g. a non-DOM environment) — callers fall back to a solid tint.
const blurHashToDataUri = (hash: string): string | undefined => {
  if (!hash) {
    return undefined;
  }

  if (typeof document === 'undefined') {
    return undefined;
  }

  const canvas = document.createElement('canvas');
  canvas.width = BLURHASH_SIZE;
  canvas.height = BLURHASH_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    return undefined;
  }

  try {
    const pixels = decode(hash, BLURHASH_SIZE, BLURHASH_SIZE);
    const imageData = context.createImageData(BLURHASH_SIZE, BLURHASH_SIZE);
    imageData.data.set(pixels);
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  } catch {
    return undefined;
  }
};

export { blurHashToDataUri };
