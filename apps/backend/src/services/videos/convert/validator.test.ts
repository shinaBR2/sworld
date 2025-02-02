import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { validateMediaURL, verifySignature } from './validator';
import { FileType, Platform } from 'src/utils/patterns';

const mockWebhookSecret = 'test-secret';

vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    webhookSignature: 'test-secret',
  },
}));

describe('verifySignature', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when signature empty', () => {
    expect(verifySignature('')).toBe(false);
    expect(verifySignature(null)).toBe(false);
  });

  it('should return true when signature matches webhook secret', () => {
    expect(verifySignature(mockWebhookSecret)).toBe(true);
  });

  it('should return false when signature does not match webhook secret', () => {
    expect(verifySignature('wrong-secret')).toBe(false);
  });
});

describe('validateMediaURL', () => {
  it('should identify YouTube URLs', () => {
    const result = validateMediaURL(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    );
    expect(result).toEqual({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube' as Platform,
      fileType: null,
    });
  });

  it('should identify Vimeo URLs', () => {
    const result = validateMediaURL('https://vimeo.com/123456789');
    expect(result).toEqual({
      url: 'https://vimeo.com/123456789',
      platform: 'vimeo' as Platform,
      fileType: null,
    });
  });

  it('should identify Mux URLs', () => {
    const result = validateMediaURL(
      'https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU'
    );
    expect(result).toEqual({
      url: 'https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU',
      platform: 'mux' as Platform,
      fileType: null,
    });
  });

  it('should identify direct video files', () => {
    const result = validateMediaURL('https://example.com/video.mp4');
    expect(result).toEqual({
      url: 'https://example.com/video.mp4',
      platform: null,
      fileType: 'video' as FileType,
    });
  });

  it('should identify HLS streams', () => {
    const result = validateMediaURL('https://example.com/stream.m3u8');
    expect(result).toEqual({
      url: 'https://example.com/stream.m3u8',
      platform: null,
      fileType: 'hls' as FileType,
    });
  });

  it('should handle uppercase file extensions', () => {
    const result = validateMediaURL('https://example.com/video.MP4');
    expect(result).toEqual({
      url: 'https://example.com/video.MP4',
      platform: null,
      fileType: 'video' as FileType,
    });
  });

  it('should handle URLs with query parameters', () => {
    const result = validateMediaURL('https://example.com/video.mp4?token=123');
    expect(result).toEqual({
      url: 'https://example.com/video.mp4?token=123',
      platform: null,
      fileType: 'video' as FileType,
    });
  });

  it('should return null for both platform and fileType for invalid URLs', () => {
    const result = validateMediaURL('https://example.com/image.jpg');
    expect(result).toEqual({
      url: 'https://example.com/image.jpg',
      platform: null,
      fileType: null,
    });
  });

  it('should prioritize platform over file extension if both match', () => {
    // A YouTube URL that happens to end in .mp4
    const result = validateMediaURL(
      'https://youtube.com/watch?v=dQw4w9WgXcQ&dummy.mp4'
    );
    expect(result).toEqual({
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ&dummy.mp4',
      platform: 'youtube' as Platform,
      fileType: null,
    });
  });

  it('should handle Facebook URLs', () => {
    const result = validateMediaURL(
      'https://www.facebook.com/watch/123456789/'
    );
    expect(result).toEqual({
      url: 'https://www.facebook.com/watch/123456789/',
      platform: 'facebook' as Platform,
      fileType: null,
    });
  });

  it('should handle Facebook Watch URLs', () => {
    const result = validateMediaURL('https://fb.watch/123abc/');
    expect(result).toEqual({
      url: 'https://fb.watch/123abc/',
      platform: 'facebookWatch' as Platform,
      fileType: null,
    });
  });

  it('should handle different video formats', () => {
    const formats = ['mp4', 'mov', 'm4v'];
    formats.forEach(format => {
      const result = validateMediaURL(`https://example.com/video.${format}`);
      expect(result).toEqual({
        url: `https://example.com/video.${format}`,
        platform: null,
        fileType: 'video' as FileType,
      });
    });
  });
});
