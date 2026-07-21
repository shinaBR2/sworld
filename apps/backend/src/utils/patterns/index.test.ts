import { describe, it, expect } from 'vitest';
import { urlPatterns, fileExtensionPatterns } from './index';

describe('urlPatterns', () => {
  describe('youtube', () => {
    const validUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://youtube.com/shorts/dQw4w9WgXcQ',
      'https://youtube.com/live/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://youtube-nocookie.com/embed/dQw4w9WgXcQ',
      'https://youtube.com/playlist?list=PLxXu6WS9YcC',
      'https://youtube.com/user/username',
    ];

    const invalidUrls = [
      'https://youtu.be/tooshort',
      'https://youtube.com/notavalidpath',
      'https://youtube.com/watch',
      'https://youtube.com/watch?',
      'https://youtube.com/watch?v=',
      'https://youtube.com/shorts/',
    ];

    validUrls.forEach((url) => {
      it(`should match ${url}`, () => {
        expect(urlPatterns.youtube.test(url)).toBe(true);
      });
    });

    invalidUrls.forEach((url) => {
      it(`should not match ${url}`, () => {
        expect(urlPatterns.youtube.test(url)).toBe(false);
      });
    });
  });

  describe('vimeo', () => {
    const validUrls = [
      'https://vimeo.com/123456789',
      'https://vimeo.com/channels/staffpicks/123456789',
      'https://vimeo.com/groups/name/videos/123456789',
      'https://vimeo.com/album/123456/video/123456789',
      'https://vimeo.com/showcase/123456/video/123456789',
    ];

    const invalidUrls = ['https://vimeo.com/progressive_redirect/123456789'];

    validUrls.forEach((url) => {
      it(`should match ${url}`, () => {
        expect(urlPatterns.vimeo.test(url)).toBe(true);
      });
    });

    invalidUrls.forEach((url) => {
      it(`should not match ${url}`, () => {
        expect(urlPatterns.vimeo.test(url)).toBe(false);
      });
    });
  });

  describe('mux', () => {
    const validUrls = [
      'https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU',
      'https://stream.mux.com/rs2DfGw02002j01F9R9GeNrxKDpSoNj01q86lwzJYUgg8',
    ];

    const invalidUrls = [
      'https://stream.mux.com/video.m3u8',
      'https://stream.mux.com/',
      'https://notmux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU',
    ];

    validUrls.forEach((url) => {
      it(`should match ${url}`, () => {
        expect(urlPatterns.mux.test(url)).toBe(true);
      });
    });

    invalidUrls.forEach((url) => {
      it(`should not match ${url}`, () => {
        expect(urlPatterns.mux.test(url)).toBe(false);
      });
    });
  });

  describe('facebook', () => {
    const validUrls = [
      'http://facebook.com/video/video.php?v=123456789',
      'https://www.facebook.com/watch/123456789',
      'http://www.facebook.com/path/videos/123456789',
      'https://facebook.com/path/story/123456789',
    ];

    const invalidUrls = [
      'https://www.facebook.com/profile.php',
      'https://www.facebook.com/messages',
      'https://facebook.com/path/other/123456789',
    ];

    validUrls.forEach((url) => {
      it(`should match ${url}`, () => {
        expect(urlPatterns.facebook.test(url)).toBe(true);
      });
    });

    invalidUrls.forEach((url) => {
      it(`should not match ${url}`, () => {
        expect(urlPatterns.facebook.test(url)).toBe(false);
      });
    });
  });
});

describe('fileExtensionPatterns', () => {
  describe('video', () => {
    const validUrls = [
      'https://example.com/video.mp4',
      'https://example.com/video.mov',
      'https://example.com/video.m4v',
      'https://example.com/video.ts',
      'https://example.com/video.MP4',
      'https://example.com/video.mp4?query=123',
      'https://example.com/path/to/video.mov?version=2&type=hd',
    ];

    const invalidUrls = [
      'https://example.com/video.webm',
      'https://example.com/video.ogv',
      'https://example.com/video.mp4.invalid',
      'https://example.com/video.mp',
      'https://example.com/videomp4',
      'https://example.com/video.mp3',
      'https://example.com/video.mpeg',
      'https://example.com/video.flv',
      'https://example.com/video.wmv',
      'https://example.com/video.mkv',
    ];

    validUrls.forEach((url) => {
      it(`should match ${url}`, () => {
        expect(fileExtensionPatterns.video.test(url)).toBe(true);
      });
    });

    invalidUrls.forEach((url) => {
      it(`should not match ${url}`, () => {
        expect(fileExtensionPatterns.video.test(url)).toBe(false);
      });
    });
  });

  describe('hls', () => {
    const validUrls = [
      'https://example.com/stream.m3u8',
      'https://example.com/path/to/playlist.m3u8',
      'https://example.com/stream.m3u8?token=123',
      'https://example.com/stream.M3U8',
    ];

    const invalidUrls = [
      'https://example.com/stream.m3u',
      'https://example.com/stream.m3u8.invalid',
      'https://example.com/streamm3u8',
      'https://example.com/stream.mp4',
    ];

    validUrls.forEach((url) => {
      it(`should match ${url}`, () => {
        expect(fileExtensionPatterns.hls.test(url)).toBe(true);
      });
    });

    invalidUrls.forEach((url) => {
      it(`should not match ${url}`, () => {
        expect(fileExtensionPatterns.hls.test(url)).toBe(false);
      });
    });
  });
});
