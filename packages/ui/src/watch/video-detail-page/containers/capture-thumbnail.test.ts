import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  captureFrameBlob,
  fitWithinBox,
  TAINTED_CANVAS_MESSAGE,
  TaintedCanvasError,
  uploadBlob,
} from './capture-thumbnail';

describe('fitWithinBox', () => {
  it('fits a 16:9 frame inside the 300x200 box preserving aspect ratio', () => {
    expect(fitWithinBox({ sourceWidth: 1920, sourceHeight: 1080 })).toEqual({
      width: 300,
      height: 169,
    });
  });

  it('fits a tall frame by height', () => {
    expect(fitWithinBox({ sourceWidth: 1080, sourceHeight: 1920 })).toEqual({
      width: 113,
      height: 200,
    });
  });

  it('never upscales a frame smaller than the box', () => {
    expect(fitWithinBox({ sourceWidth: 100, sourceHeight: 50 })).toEqual({
      width: 100,
      height: 50,
    });
  });

  it('falls back to the full box for a zero-sized frame', () => {
    expect(fitWithinBox({ sourceWidth: 0, sourceHeight: 0 })).toEqual({
      width: 300,
      height: 200,
    });
  });
});

// Build a fake <video> element plus a canvas whose toBlob behaviour we control.
const setupCanvas = (props: {
  toBlob: HTMLCanvasElement['toBlob'];
  drawImage?: () => void;
}) => {
  const { toBlob, drawImage } = props;
  const ctx = {
    drawImage: drawImage ?? vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ctx),
    toBlob,
  } as unknown as HTMLCanvasElement;

  vi.spyOn(document, 'createElement').mockReturnValue(canvas);
  return { canvas, ctx };
};

const fakeVideo = { videoWidth: 1920, videoHeight: 1080 } as HTMLVideoElement;

describe('captureFrameBlob', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('draws the frame downscaled and resolves with a JPEG blob', async () => {
    const blob = new Blob(['x'], { type: 'image/jpeg' });
    const drawImage = vi.fn();
    const toBlob = vi.fn((cb: BlobCallback) =>
      cb(blob),
    ) as unknown as HTMLCanvasElement['toBlob'];

    const { canvas } = setupCanvas({ toBlob, drawImage });

    const result = await captureFrameBlob(fakeVideo);

    expect(result).toBe(blob);
    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(169);
    expect(drawImage).toHaveBeenCalledWith(fakeVideo, 0, 0, 300, 169);
    expect(toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.85,
    );
  });

  it('throws TaintedCanvasError when toBlob yields null (tainted canvas)', async () => {
    const toBlob = vi.fn((cb: BlobCallback) =>
      cb(null),
    ) as unknown as HTMLCanvasElement['toBlob'];
    setupCanvas({ toBlob });

    await expect(captureFrameBlob(fakeVideo)).rejects.toBeInstanceOf(
      TaintedCanvasError,
    );
  });

  it('maps a SecurityError from drawImage/toBlob to TaintedCanvasError', async () => {
    const toBlob = vi.fn(() => {
      throw new DOMException('tainted', 'SecurityError');
    }) as unknown as HTMLCanvasElement['toBlob'];
    setupCanvas({ toBlob });

    const error = await captureFrameBlob(fakeVideo).catch((e) => e);
    expect(error).toBeInstanceOf(TaintedCanvasError);
    expect(error.message).toBe(TAINTED_CANVAS_MESSAGE);
  });
});

describe('uploadBlob', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('PUTs the blob to the signed URL with the JPEG content type', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200 } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const blob = new Blob(['x'], { type: 'image/jpeg' });
    await uploadBlob({ uploadUrl: 'https://signed.example/put', blob });

    expect(fetchMock).toHaveBeenCalledWith('https://signed.example/put', {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' },
    });
    vi.unstubAllGlobals();
  });

  it('throws on a non-2xx response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 403 } as Response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      uploadBlob({
        uploadUrl: 'https://signed.example/put',
        blob: new Blob(['x']),
      }),
    ).rejects.toThrow('403');
    vi.unstubAllGlobals();
  });
});
