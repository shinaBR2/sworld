import { describe, expect, it } from 'vitest';
import { isVideoFile, VIDEO_EXTENSIONS } from './video-ingest';

describe('isVideoFile', () => {
  it('accepts every supported video container', () => {
    for (const ext of VIDEO_EXTENSIONS) {
      expect(isVideoFile(`clip${ext}`)).toBe(true);
    }
  });

  it('is case-insensitive on the extension', () => {
    expect(isVideoFile('CLIP.MP4')).toBe(true);
    expect(isVideoFile('holiday.MoV')).toBe(true);
  });

  it('matches on a full path, using only the final extension', () => {
    expect(isVideoFile('/Takeout/Google Photos/2019/clip.mp4')).toBe(true);
    // A `.json` sidecar that merely mentions a video name is not a video.
    expect(isVideoFile('clip.mp4.supplemental-metadata.json')).toBe(false);
  });

  it('rejects images and other non-video files', () => {
    expect(isVideoFile('photo.jpg')).toBe(false);
    expect(isVideoFile('photo.jpeg')).toBe(false);
    expect(isVideoFile('shot.png')).toBe(false);
    expect(isVideoFile('image.webp')).toBe(false);
    expect(isVideoFile('live.heic')).toBe(false);
    expect(isVideoFile('meta.json')).toBe(false);
  });

  it('rejects a file with no extension', () => {
    expect(isVideoFile('README')).toBe(false);
    expect(isVideoFile('/a/b/noext')).toBe(false);
  });
});
