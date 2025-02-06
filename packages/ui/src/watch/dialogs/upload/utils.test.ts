import { describe, it, expect, vi } from 'vitest';
import { canPlayUrls } from './utils';

// Mock react-player
vi.mock('react-player', () => ({
  default: {
    canPlay: vi.fn((url: string) => {
      // Simulate canPlay logic for testing
      return url.includes('youtube.com') || url.includes('vimeo.com');
    }),
  },
}));

describe('canPlayUrls', () => {
  it('should validate URLs correctly', async () => {
    const urls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://vimeo.com/123456',
      'https://invalid-url.com',
      '  https://www.youtube.com/watch?v=abc123  ',
    ];

    const results = await canPlayUrls(urls);

    expect(results).toHaveLength(4);
    expect(results[0]).toEqual({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isValid: true,
    });
    expect(results[1]).toEqual({
      url: 'https://vimeo.com/123456',
      isValid: true,
    });
    expect(results[2]).toEqual({
      url: 'https://invalid-url.com',
      isValid: false,
    });
    expect(results[3]).toEqual({
      url: 'https://www.youtube.com/watch?v=abc123',
      isValid: true,
    });
  });

  it('should handle empty and whitespace-only inputs', async () => {
    const urls = ['', '   ', null, undefined];

    const results = await canPlayUrls(urls as string[]);

    expect(results).toHaveLength(0);
  });

  it('should trim whitespace from URLs', async () => {
    const urls = ['  https://www.youtube.com/watch?v=dQw4w9WgXcQ  '];

    const results = await canPlayUrls(urls);

    expect(results[0].url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });
});
