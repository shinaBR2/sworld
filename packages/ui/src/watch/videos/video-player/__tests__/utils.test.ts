import { describe, expect, it } from 'vitest';
import { getVideoPlayerOptions } from '../utils';

describe('Video Player Utils', () => {
  describe('getVideoPlayerOptions', () => {
    it('should handle YouTube URLs', () => {
      const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const options = getVideoPlayerOptions(youtubeUrl);

      expect(options).toEqual({
        techOrder: ['youtube', 'html5'],
        sources: [{ type: 'video/youtube', src: youtubeUrl }],
      });
    });

    it('should handle YouTube short URLs', () => {
      const youtubeUrl = 'https://youtu.be/dQw4w9WgXcQ';
      const options = getVideoPlayerOptions(youtubeUrl);

      expect(options).toEqual({
        techOrder: ['youtube', 'html5'],
        sources: [{ type: 'video/youtube', src: youtubeUrl }],
      });
    });

    it('should handle HLS URLs', () => {
      const hlsUrl = 'https://example.com/video.m3u8';
      const options = getVideoPlayerOptions(hlsUrl);

      expect(options).toEqual({
        techOrder: ['html5'],
        sources: [{ type: 'application/x-mpegURL', src: hlsUrl }],
      });
    });

    it('should default to HLS for unknown formats', () => {
      const unknownUrl = 'https://example.com/video';
      const options = getVideoPlayerOptions(unknownUrl);

      expect(options).toEqual({
        techOrder: ['html5'],
        sources: [{ type: 'application/x-mpegURL', src: unknownUrl }],
      });
    });

    it('should merge baseOptions with generated options', () => {
      const hlsUrl = 'https://example.com/video.m3u8';
      const baseOptions = {
        autoplay: true,
        controls: true,
      };

      const options = getVideoPlayerOptions(hlsUrl, baseOptions);

      expect(options).toEqual({
        autoplay: true,
        controls: true,
        techOrder: ['html5'],
        sources: [{ type: 'application/x-mpegURL', src: hlsUrl }],
      });
    });
  });
});
