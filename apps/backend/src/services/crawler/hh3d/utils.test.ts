import { describe, expect, it, vi } from 'vitest';
import { videoUrlXHRMatcher } from './utils';

// Mock the selectors module
vi.mock('./selectors', () => ({
  videoUrlXHRUrl: 'api/videos',
}));

describe('videoUrlXHRMatcher', () => {
  it('should return true when URL includes the pattern', () => {
    const testUrls = [
      'https://example.com/api/videos/123',
      'http://localhost:3000/api/videos?id=456',
      '/api/videos/stream',
      'https://domain.com/path/api/videos/content',
    ];

    testUrls.forEach(url => {
      expect(videoUrlXHRMatcher(url)).toBe(true);
    });
  });

  it('should return false when URL does not include the pattern', () => {
    const testUrls = [
      'https://example.com/api/auth',
      'http://localhost:3000/videos?id=456',
      '/api/watch/stream',
      'https://domain.com/path/video/content',
    ];

    testUrls.forEach(url => {
      expect(videoUrlXHRMatcher(url)).toBe(false);
    });
  });

  it('should be case sensitive', () => {
    const testUrls = ['https://example.com/API/videos/123', 'http://localhost:3000/api/VIDEOS?id=456'];

    testUrls.forEach(url => {
      expect(videoUrlXHRMatcher(url)).toBe(false);
    });
  });

  it('should handle empty input', () => {
    expect(videoUrlXHRMatcher('')).toBe(false);
  });
});
