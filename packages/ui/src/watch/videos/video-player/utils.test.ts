import { describe, expect, it } from 'vitest';
import type { PlayableVideo } from '../types';
import { getVideoPlayerOptions } from './utils';

describe('video player utils', () => {
  const mockVideo: PlayableVideo = {
    id: '123',
    source: 'https://example.com/video.m3u8',
    title: 'Test Video',
    subtitles: [
      {
        src: 'https://example.com/en.vtt',
        lang: 'en',
        label: 'English',
        isDefault: true,
      },
      {
        src: 'https://example.com/es.vtt',
        lang: 'es',
        label: 'Spanish',
      },
    ],
  };

  describe('getVideoPlayerOptions', () => {
    it('should generate basic player options with HLS sources', () => {
      const result = getVideoPlayerOptions(mockVideo);

      expect(result).toMatchObject({
        techOrder: ['html5'],
        sources: [{ type: 'application/x-mpegURL', src: 'https://example.com/video.m3u8' }],
      });
    });

    it('should handle YouTube URLs with correct techOrder', () => {
      const youtubeVideo: PlayableVideo = {
        ...mockVideo,
        source: 'https://youtube.com/watch?v=abc123',
      };

      const result = getVideoPlayerOptions(youtubeVideo);
      expect(result.techOrder).toEqual(['youtube', 'html5']);
      expect(result.sources).toEqual([
        {
          type: 'video/youtube',
          src: 'https://youtube.com/watch?v=abc123',
        },
      ]);
    });

    it('should include subtitle tracks when available', () => {
      const result = getVideoPlayerOptions(mockVideo);

      expect(result.tracks).toEqual([
        {
          kind: 'captions',
          src: 'https://example.com/en.vtt',
          lang: 'en',
          label: 'English',
          default: true,
        },
        {
          kind: 'captions',
          src: 'https://example.com/es.vtt',
          lang: 'es',
          label: 'Spanish',
          default: undefined,
        },
      ]);
    });

    it('should merge with baseOptions', () => {
      const baseOptions = {
        autoplay: true,
        controls: false,
        aspectRatio: '16:9',
      };

      const result = getVideoPlayerOptions(mockVideo, baseOptions);

      expect(result).toMatchObject({
        ...baseOptions,
        techOrder: ['html5'],
        sources: expect.any(Array),
      });
    });

    it('should handle videos without subtitles', () => {
      const videoWithoutSubtitles: PlayableVideo = {
        ...mockVideo,
        subtitles: undefined,
      };

      const result = getVideoPlayerOptions(videoWithoutSubtitles);
      expect(result.tracks).toBeUndefined();
    });
  });
});
