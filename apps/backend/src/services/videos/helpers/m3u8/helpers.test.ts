import { fetchWithError } from 'src/utils/fetch';
import { describe, expect, test, vi } from 'vitest';
import { parseM3U8Content } from './helpers';

vi.mock('src/utils/fetch', () => ({
  fetchWithError: vi.fn(),
}));

describe('M3U8 parser', () => {
  // Helper to normalize line endings and whitespace
  const normalizeContent = (content: string) =>
    content
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .join('\n');

  describe('parseM3U8Content', () => {
    const baseUrl = 'https://example.com';
    const excludePatterns = [/\/adjump\//, /\/ads\//, /\/commercial\//];

    test('should throw error when fetch fails', async () => {
      vi.mocked(fetchWithError).mockResolvedValue({
        text: async () => {
          throw new Error('Failed to fetch m3u8: Not Found');
        },
      } as any);

      await expect(parseM3U8Content(baseUrl, excludePatterns)).rejects.toThrow(
        'Failed to fetch m3u8: Not Found',
      );
    });

    test('should handle m3u8 with multiple ad patterns', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        segment1.ts
        #EXT-X-DISCONTINUITY
        #EXTINF:5.96,
        /adjump/ad1.ts
        #EXTINF:1.96,
        /ads/ad2.ts
        #EXTINF:2.5,
        /commercial/ad3.ts
        #EXT-X-DISCONTINUITY
        #EXTINF:3,
        segment2.ts
        #EXT-X-ENDLIST
      `;

      const expected = normalizeContent(`
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        0.ts
        #EXTINF:3,
        1.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { modifiedContent, segments } = await parseM3U8Content(
        baseUrl,
        excludePatterns,
      );

      expect(normalizeContent(modifiedContent)).toBe(expected);
      expect(segments.included).toEqual([
        {
          url: 'https://example.com/segment1.ts',
          name: '0.ts', // Added name field
          duration: 3,
        },
        {
          url: 'https://example.com/segment2.ts',
          name: '1.ts', // Added name field
          duration: 3,
        },
      ]);
      expect(segments.excluded).toEqual([
        {
          url: 'https://example.com/adjump/ad1.ts',
          name: '',
        },
        {
          url: 'https://example.com/ads/ad2.ts',
          name: '',
        },
        {
          url: 'https://example.com/commercial/ad3.ts',
          name: '',
        },
      ]);
    });

    test('should handle m3u8 with mixed ad patterns', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        segment1.ts
        #EXTINF:5.96,
        /ads/ad1.ts
        #EXTINF:3,
        segment2.ts
        #EXTINF:2.5,
        /commercial/ad2.ts
        #EXTINF:3,
        segment3.ts
        #EXT-X-ENDLIST
      `;

      const expected = normalizeContent(`
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        0.ts
        #EXTINF:3,
        1.ts
        #EXTINF:3,
        2.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { modifiedContent, segments } = await parseM3U8Content(
        baseUrl,
        excludePatterns,
      );

      expect(normalizeContent(modifiedContent)).toBe(expected);
      // Check included segments in order
      expect(segments.included).toEqual([
        {
          url: 'https://example.com/segment1.ts',
          name: '0.ts',
          duration: 3,
        },
        {
          url: 'https://example.com/segment2.ts',
          name: '1.ts',
          duration: 3,
        },
        {
          url: 'https://example.com/segment3.ts',
          name: '2.ts',
          duration: 3,
        },
      ]);

      // Check excluded segments in order
      expect(segments.excluded).toEqual([
        {
          url: 'https://example.com/ads/ad1.ts',
          name: '',
        },
        {
          url: 'https://example.com/commercial/ad2.ts',
          name: '',
        },
      ]);

      // Check content contains all required HLS tags
      expect(modifiedContent).toContain('#EXTM3U');
      expect(modifiedContent).toContain('#EXT-X-VERSION:3');
      expect(modifiedContent).toContain('#EXT-X-TARGETDURATION:10');
      expect(modifiedContent).toContain('#EXT-X-ENDLIST');

      // Check content doesn't contain ad segments or their durations
      expect(modifiedContent).not.toContain('5.96');
      expect(modifiedContent).not.toContain('2.5');
      expect(modifiedContent).not.toContain('/ads/');
      expect(modifiedContent).not.toContain('/commercial/');
    });

    test('should handle m3u8 with DISCONTINUITY markers', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        segment1.ts
        #EXT-X-DISCONTINUITY
        #EXTINF:5.96,
        /adjump/ad1.ts
        #EXTINF:1.96,
        /adjump/ad2.ts
        #EXT-X-DISCONTINUITY
        #EXTINF:3,
        segment2.ts
        #EXT-X-ENDLIST
      `;

      const expected = normalizeContent(`
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        0.ts
        #EXTINF:3,
        1.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { modifiedContent, segments } = await parseM3U8Content(
        baseUrl,
        excludePatterns,
      );

      expect(normalizeContent(modifiedContent)).toBe(expected);
      // Check included segments in order
      expect(segments.included).toEqual([
        {
          url: 'https://example.com/segment1.ts',
          name: '0.ts',
          duration: 3,
        },
        {
          url: 'https://example.com/segment2.ts',
          name: '1.ts',
          duration: 3,
        },
      ]);

      // Check excluded segments in order
      expect(segments.excluded).toEqual([
        {
          url: 'https://example.com/adjump/ad1.ts',
          name: '',
        },
        { url: 'https://example.com/adjump/ad2.ts', name: '' },
      ]);

      // Check content contains all required HLS tags
      expect(modifiedContent).toContain('#EXTM3U');
      expect(modifiedContent).toContain('#EXT-X-VERSION:3');
      expect(modifiedContent).toContain('#EXT-X-TARGETDURATION:10');
      expect(modifiedContent).toContain('#EXT-X-ENDLIST');

      // Check content doesn't contain ad segments or their durations
      expect(modifiedContent).not.toContain('5.96');
      expect(modifiedContent).not.toContain('2.5');
      expect(modifiedContent).not.toContain('/ads/');
      expect(modifiedContent).not.toContain('/commercial/');
    });

    test('should handle m3u8 without DISCONTINUITY markers', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        segment1.ts
        #EXTINF:5.96,
        /adjump/ad1.ts
        #EXTINF:3,
        segment2.ts
        #EXT-X-ENDLIST
      `;

      const expected = normalizeContent(`
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        0.ts
        #EXTINF:3,
        1.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { modifiedContent, segments } = await parseM3U8Content(
        baseUrl,
        excludePatterns,
      );

      expect(normalizeContent(modifiedContent)).toBe(expected);
      expect(segments.included).toEqual([
        {
          url: 'https://example.com/segment1.ts',
          name: '0.ts',
          duration: 3,
        },
        {
          url: 'https://example.com/segment2.ts',
          name: '1.ts',
          duration: 3,
        },
      ]);
      expect(segments.excluded).toHaveLength(1);
    });

    test('should handle m3u8 with no ads', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        segment1.ts
        #EXTINF:3,
        segment2.ts
        #EXTINF:3,
        segment3.ts
        #EXT-X-ENDLIST
      `;

      const expected = normalizeContent(`
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        0.ts
        #EXTINF:3,
        1.ts
        #EXTINF:3,
        2.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { modifiedContent, segments } = await parseM3U8Content(
        baseUrl,
        excludePatterns,
      );

      expect(normalizeContent(modifiedContent)).toBe(expected);
      expect(segments.included).toEqual([
        {
          url: 'https://example.com/segment1.ts',
          name: '0.ts', // Added name field
          duration: 3,
        },
        {
          url: 'https://example.com/segment2.ts',
          name: '1.ts',
          duration: 3,
        },
        {
          url: 'https://example.com/segment3.ts',
          name: '2.ts',
          duration: 3,
        },
      ]);
      expect(segments.excluded).toHaveLength(0);
    });

    test('should handle m3u8 with playlist type', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-PLAYLIST-TYPE:VOD
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        segment1.ts
        #EXT-X-ENDLIST
      `;

      const expected = normalizeContent(`
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-PLAYLIST-TYPE:VOD
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        0.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { modifiedContent, segments } = await parseM3U8Content(
        baseUrl,
        excludePatterns,
      );
      expect(normalizeContent(modifiedContent)).toBe(expected);
      expect(modifiedContent).toContain('#EXT-X-PLAYLIST-TYPE:VOD');
      expect(segments.included).toEqual([
        { url: 'https://example.com/segment1.ts', name: '0.ts', duration: 3 },
      ]);
      expect(segments.excluded).toHaveLength(0);
    });

    test('should handle malformed m3u8', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXTINF:3,
        #EXTINF:3,
        segment1.ts
        /adjump/ad1.ts
        segment2.ts
      `;

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { modifiedContent, segments } = await parseM3U8Content(
        baseUrl,
        excludePatterns,
      );

      expect(segments.included).toEqual([
        {
          url: 'https://example.com/segment1.ts',
          name: '0.ts', // Added
          duration: 3,
        },
      ]);
      expect(segments.excluded).toEqual([
        {
          url: 'https://example.com/adjump/ad1.ts',
          name: '',
        },
      ]);
      const expectedContent = normalizeContent(`
        #EXTM3U
        #EXT-X-VERSION:3
        #EXTINF:3,
        0.ts
      `);
      expect(normalizeContent(modifiedContent)).toBe(expectedContent);
    });

    test('should handle m3u8 with duration calculation', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:9.009,
        segment1.ts
        #EXTINF:8.008,
        segment2.ts
        #EXTINF:7.007,
        /path/to/segment3.ts
        #EXTINF:6.006,
        https://example.com/ads/commercial.ts
        #EXTINF:5.005,
        segment4.ts
        #EXT-X-ENDLIST
      `;

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { duration } = await parseM3U8Content(baseUrl, excludePatterns);

      expect(duration).toBe(29);
    });

    test('should handle m3u8 with multiple ad patterns', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        segment1.ts
        #EXT-X-DISCONTINUITY
        #EXTINF:5.96,
        /adjump/ad1.ts
        #EXTINF:1.96,
        /ads/ad2.ts
        #EXTINF:2.5,
        /commercial/ad3.ts
        #EXT-X-DISCONTINUITY
        #EXTINF:3,
        segment2.ts
        #EXT-X-ENDLIST
      `;

      const expected = normalizeContent(`
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:3,
        0.ts
        #EXTINF:3,
        1.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { modifiedContent, segments, duration } = await parseM3U8Content(
        baseUrl,
        excludePatterns,
      );

      // Verify modified content
      expect(normalizeContent(modifiedContent)).toBe(expected);

      // Verify duration calculation
      expect(duration).toBe(6);
    });

    test('should handle m3u8 with no valid segments', async () => {
      const content = `
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:10
        #EXTINF:6.006,
        https://example.com/ads/commercial1.ts
        #EXTINF:7.007,
        https://example.com/ads/commercial2.ts
        #EXT-X-ENDLIST
      `;

      const mockResponse = {
        text: () => Promise.resolve(content),
      };
      vi.mocked(fetchWithError).mockResolvedValue(mockResponse as any);

      const { duration } = await parseM3U8Content(baseUrl, excludePatterns);

      // Verify duration
      expect(duration).toBe(0);
    });
  });
});
