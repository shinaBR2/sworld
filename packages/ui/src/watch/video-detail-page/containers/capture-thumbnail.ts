// Client-side thumbnail capture.
//
// Instead of asking the server to run ffmpeg against the source file (unreliable
// on cold start and prone to Linux seek quirks), we grab the frame that's
// already decoded in the user's <video> element, downscale it to a small JPEG on
// a canvas, and upload that straight to the bucket via a signed URL.
//
// The one hard requirement for this to work is a *CORS-enabled* video: the
// media element must be loaded with `crossOrigin="anonymous"` AND the bucket
// must return permissive GET CORS headers. Without both, drawing the frame taints
// the canvas and `toBlob`/`toDataURL` throw a `SecurityError`.

// Target thumbnail box. We fit the frame inside this while preserving aspect
// ratio, so a 16:9 frame becomes ~300x169 and never exceeds these bounds.
const THUMBNAIL_MAX_WIDTH = 300;
const THUMBNAIL_MAX_HEIGHT = 200;
const THUMBNAIL_MIME = 'image/jpeg';
const THUMBNAIL_QUALITY = 0.85;

const TAINTED_CANVAS_MESSAGE =
  "Couldn't capture the frame — the video isn't CORS-enabled";

interface FittedSize {
  width: number;
  height: number;
}

// Fit a source size inside the max box, preserving aspect ratio. Never upscales.
const fitWithinBox = (props: {
  sourceWidth: number;
  sourceHeight: number;
}): FittedSize => {
  const { sourceWidth, sourceHeight } = props;

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return { width: THUMBNAIL_MAX_WIDTH, height: THUMBNAIL_MAX_HEIGHT };
  }

  const scale = Math.min(
    THUMBNAIL_MAX_WIDTH / sourceWidth,
    THUMBNAIL_MAX_HEIGHT / sourceHeight,
    1,
  );

  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
};

// Raised for a tainted (cross-origin) canvas so callers can show a clear message
// distinct from a generic capture failure.
class TaintedCanvasError extends Error {
  constructor() {
    super(TAINTED_CANVAS_MESSAGE);
    this.name = 'TaintedCanvasError';
  }
}

// Draw the current frame of `video` onto a downscaled canvas and return it as a
// JPEG blob. Throws `TaintedCanvasError` when the canvas is cross-origin tainted.
const captureFrameBlob = async (video: HTMLVideoElement): Promise<Blob> => {
  const { width, height } = fitWithinBox({
    sourceWidth: video.videoWidth,
    sourceHeight: video.videoHeight,
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Couldn't capture the frame — canvas is unavailable");
  }

  try {
    ctx.drawImage(video, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      // toBlob throws synchronously for a tainted canvas in some engines, and
      // yields null in others — handle both.
      try {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new TaintedCanvasError());
            }
          },
          THUMBNAIL_MIME,
          THUMBNAIL_QUALITY,
        );
      } catch (error) {
        reject(toCaptureError(error));
      }
    });
  } catch (error) {
    throw toCaptureError(error);
  }
};

// Normalise a thrown value into a TaintedCanvasError when it's a SecurityError,
// otherwise pass it through.
const toCaptureError = (error: unknown): Error => {
  if (error instanceof TaintedCanvasError) return error;
  if (error instanceof DOMException && error.name === 'SecurityError') {
    return new TaintedCanvasError();
  }
  return error instanceof Error ? error : new Error(String(error));
};

// PUT the blob to the signed upload URL. Throws on a non-2xx response.
const uploadBlob = async (props: {
  uploadUrl: string;
  blob: Blob;
}): Promise<void> => {
  const { uploadUrl, blob } = props;

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': THUMBNAIL_MIME },
  });

  if (!response.ok) {
    throw new Error(`Thumbnail upload failed (${response.status})`);
  }
};

export {
  captureFrameBlob,
  fitWithinBox,
  TaintedCanvasError,
  TAINTED_CANVAS_MESSAGE,
  THUMBNAIL_MIME,
  uploadBlob,
};
