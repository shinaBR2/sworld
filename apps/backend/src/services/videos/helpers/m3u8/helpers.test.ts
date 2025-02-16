import { describe, expect, vi, test, beforeEach } from 'vitest';
import { downloadSegments, parseM3U8Content, streamPlaylistFile, streamSegmentFile, streamSegments } from './helpers';
import { downloadFile, verifyFileSize } from '../file';
import { logger } from 'src/utils/logger';
import { Readable } from 'node:stream';
import fetch from 'node-fetch';
import { streamFile } from '../gcp-cloud-storage';
import type { Response } from 'node-fetch';

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

vi.mock('../gcp-cloud-storage', () => ({
  streamFile: vi.fn(),
}));

vi.mock('../file', () => ({
  downloadFile: vi.fn(),
  verifyFileSize: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('M3U8 parser', () => {
  // Helper to normalize line endings and whitespace
  const normalizeContent = (content: string) =>
    content
      .trim()
      .split('\n')
      .map(line => line.trim())
      .join('\n');

  describe('parseM3U8Content', () => {
    const baseUrl = 'https://example.com';
    const excludePatterns = [/\/adjump\//, /\/ads\//, /\/commercial\//];

    test('should throw error when fetch response is not ok', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Not Found',
      };
      (fetch as any).mockResolvedValue(mockResponse);

      await expect(parseM3U8Content(baseUrl, excludePatterns)).rejects.toThrow('Failed to fetch m3u8: Not Found');
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
        segment1.ts
        #EXTINF:3,
        segment2.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const { modifiedContent, segments } = await parseM3U8Content(baseUrl, excludePatterns);

      expect(normalizeContent(modifiedContent)).toBe(expected);
      expect(segments.included).toEqual(['https://example.com/segment1.ts', 'https://example.com/segment2.ts']);
      expect(segments.excluded).toEqual([
        'https://example.com/adjump/ad1.ts',
        'https://example.com/ads/ad2.ts',
        'https://example.com/commercial/ad3.ts',
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
        segment1.ts
        #EXTINF:3,
        segment2.ts
        #EXTINF:3,
        segment3.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const { modifiedContent, segments } = await parseM3U8Content(baseUrl, excludePatterns);

      expect(normalizeContent(modifiedContent)).toBe(expected);
      // Check included segments in order
      expect(segments.included).toEqual([
        'https://example.com/segment1.ts',
        'https://example.com/segment2.ts',
        'https://example.com/segment3.ts',
      ]);

      // Check excluded segments in order
      expect(segments.excluded).toEqual(['https://example.com/ads/ad1.ts', 'https://example.com/commercial/ad2.ts']);

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
        segment1.ts
        #EXTINF:3,
        segment2.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const { modifiedContent, segments } = await parseM3U8Content(baseUrl, excludePatterns);

      expect(normalizeContent(modifiedContent)).toBe(expected);
      // Check included segments in order
      expect(segments.included).toEqual(['https://example.com/segment1.ts', 'https://example.com/segment2.ts']);

      // Check excluded segments in order
      expect(segments.excluded).toEqual(['https://example.com/adjump/ad1.ts', 'https://example.com/adjump/ad2.ts']);

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
        segment1.ts
        #EXTINF:3,
        segment2.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const { modifiedContent, segments } = await parseM3U8Content(baseUrl, excludePatterns);

      expect(normalizeContent(modifiedContent)).toBe(expected);
      expect(segments.included).toEqual(['https://example.com/segment1.ts', 'https://example.com/segment2.ts']);
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

      const expected = normalizeContent(content);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const { modifiedContent, segments } = await parseM3U8Content(baseUrl, excludePatterns);

      expect(normalizeContent(modifiedContent)).toBe(expected);
      expect(segments.included).toEqual([
        'https://example.com/segment1.ts',
        'https://example.com/segment2.ts',
        'https://example.com/segment3.ts',
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
        segment1.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const { modifiedContent, segments } = await parseM3U8Content(baseUrl, excludePatterns);
      expect(normalizeContent(modifiedContent)).toBe(expected);
      expect(modifiedContent).toContain('#EXT-X-PLAYLIST-TYPE:VOD');
      expect(segments.included).toEqual(['https://example.com/segment1.ts']);
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
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const { modifiedContent, segments } = await parseM3U8Content(baseUrl, excludePatterns);

      expect(segments.included).toEqual(['https://example.com/segment1.ts', 'https://example.com/segment2.ts']);
      expect(segments.excluded).toEqual(['https://example.com/adjump/ad1.ts']);
      const expectedContent = normalizeContent(`
        #EXTM3U
        #EXT-X-VERSION:3
        #EXTINF:3,
        segment1.ts
        segment2.ts
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
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

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
        segment1.ts
        #EXTINF:3,
        segment2.ts
        #EXT-X-ENDLIST
      `);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const { modifiedContent, segments, duration } = await parseM3U8Content(baseUrl, excludePatterns);

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
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(content),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const { duration } = await parseM3U8Content(baseUrl, excludePatterns);

      // Verify duration
      expect(duration).toBe(0);
    });
  });
});

describe('downloadSegments', () => {
  const mockSegments = [
    'https://example.com/segment1.ts',
    'https://example.com/segment2.ts',
    'https://example.com/segment3.ts',
  ];
  const mockTempDir = '/tmp/test';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should download segments successfully', async () => {
    await downloadSegments(mockSegments, mockTempDir);

    // Check if downloadFile was called for each segment
    expect(downloadFile).toHaveBeenCalledTimes(3);
    expect(downloadFile).toHaveBeenCalledWith('https://example.com/segment1.ts', '/tmp/test/segment1.ts');
    expect(logger.info).toHaveBeenCalledWith(
      {
        segmentName: 'segment1.ts',
        segmentUrl: 'https://example.com/segment1.ts',
      },
      'Downloading segment'
    );
  });

  test('should verify file size when maxSegmentSize is provided', async () => {
    const maxSize = 1024;
    await downloadSegments(mockSegments, mockTempDir, maxSize);

    expect(verifyFileSize).toHaveBeenCalledTimes(3);
    expect(verifyFileSize).toHaveBeenCalledWith('/tmp/test/segment1.ts', maxSize);
  });

  test('should process segments in batches of 5', async () => {
    const sixSegments = Array(6)
      .fill('')
      .map((_, i) => `https://example.com/segment${i + 1}.ts`);

    await downloadSegments(sixSegments, mockTempDir);

    const downloadCalls = vi.mocked(downloadFile).mock.calls;
    // Verify first batch (5 segments)
    const firstBatch = downloadCalls.slice(0, 5);
    expect(firstBatch.map(call => call[0])).toEqual([
      'https://example.com/segment1.ts',
      'https://example.com/segment2.ts',
      'https://example.com/segment3.ts',
      'https://example.com/segment4.ts',
      'https://example.com/segment5.ts',
    ]);
    // Verify second batch (1 segment)
    const secondBatch = downloadCalls.slice(5);
    expect(secondBatch.map(call => call[0])).toEqual(['https://example.com/segment6.ts']);
  });

  test('when error with promise.all', async () => {
    vi.mocked(downloadFile).mockRejectedValueOnce(new Error('Download failed'));

    await expect(downloadSegments(mockSegments, mockTempDir)).rejects.toThrow('Download failed');

    expect(downloadFile).toHaveBeenCalledTimes(3);
  });
});

describe('streamSegmentFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should download and stream segment file', async () => {
    // Mock successful fetch response
    const mockBody = new Readable({
      read() {
        this.push('segment data');
        this.push(null);
      },
    });

    const mockResponse = {
      ok: true,
      body: mockBody,
    };
    (fetch as any).mockResolvedValue(mockResponse);

    await streamSegmentFile('http://example.com/segment.ts', 'test-path/segment.ts');

    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('http://example.com/segment.ts', {
      timeout: 15000,
      size: 32 * 1024 * 1024,
    });

    // Verify streamFile was called with correct arguments
    expect(streamFile).toHaveBeenCalledWith({
      stream: mockBody,
      storagePath: 'test-path/segment.ts',
      options: {
        contentType: 'video/MP2T',
      },
    });
  });

  test('should throw error when fetch fails', async () => {
    const mockResponse = {
      ok: false,
      body: null,
    };
    (fetch as any).mockResolvedValue(mockResponse);

    await expect(streamSegmentFile('http://example.com/segment.ts', 'test-path/segment.ts')).rejects.toThrow(
      'Failed to fetch segment'
    );
  });

  test('should throw error when response body is null', async () => {
    const mockResponse = {
      ok: true,
      body: null,
    };
    (fetch as any).mockResolvedValue(mockResponse);

    await expect(streamSegmentFile('http://example.com/segment.ts', 'test-path/segment.ts')).rejects.toThrow(
      'Failed to fetch segment'
    );
  });
});

describe('streamPlaylistFile', () => {
  const mockStreamFile = vi.mocked(streamFile);

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  test('should create a readable stream from content', async () => {
    const content = '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1280000\ntest.ts';
    const storagePath = 'test/playlist.m3u8';

    // Call the function
    await streamPlaylistFile(content, storagePath);

    // Verify streamFile was called
    expect(mockStreamFile).toHaveBeenCalledOnce();

    // Get the arguments passed to streamFile
    const params = mockStreamFile.mock.calls[0][0];

    // Check stream is a Readable
    expect(params.stream).toBeInstanceOf(Readable);

    // Check storage path
    expect(params.storagePath).toBe(storagePath);

    // Check content type
    expect(params.options).toEqual({
      contentType: 'application/vnd.apple.mpegurl',
    });
  });

  test('should handle empty content', async () => {
    const content = '';
    const storagePath = 'test/empty-playlist.m3u8';

    await streamPlaylistFile(content, storagePath);

    expect(mockStreamFile).toHaveBeenCalledOnce();

    const { stream } = mockStreamFile.mock.calls[0][0];
    expect(stream).toBeInstanceOf(Readable);
  });

  test('should stream playlist with special characters', async () => {
    const content = '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=1280x720\npath/with/special-chars.ts';
    const storagePath = 'test/complex-playlist.m3u8';

    await streamPlaylistFile(content, storagePath);

    expect(mockStreamFile).toHaveBeenCalledOnce();

    const params = mockStreamFile.mock.calls[0][0];
    expect(params.storagePath).toBe(storagePath);
    expect(params.options.contentType).toBe('application/vnd.apple.mpegurl');
  });

  test('should propagate errors from streamFile', async () => {
    const content = '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1280000\ntest.ts';
    const storagePath = 'test/error-playlist.m3u8';
    const mockError = new Error('Stream error');

    // Mock streamFile to throw an error
    mockStreamFile.mockRejectedValueOnce(mockError);

    // Expect the error to be propagated
    await expect(streamPlaylistFile(content, storagePath)).rejects.toThrow('Stream error');

    expect(mockStreamFile).toHaveBeenCalledOnce();
  });
});

describe('streamSegments', () => {
  const mockFetch = vi.mocked(fetch);
  const mockStreamFile = vi.mocked(streamFile);
  const mockLogger = vi.mocked(logger);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should process segments in batches based on concurrency limit', async () => {
    const segmentUrls = [
      'http://example.com/seg-1.ts',
      'http://example.com/seg-2.ts',
      'http://example.com/seg-3.ts',
      'http://example.com/seg-4.ts',
    ];
    const baseStoragePath = 'videos/test';
    const mockBody = new ReadableStream();

    // Mock successful fetch responses
    mockFetch.mockResolvedValue({
      ok: true,
      body: mockBody,
      status: 200,
      statusText: 'OK',
    } as unknown as Response);

    // Mock successful streamFile responses
    mockStreamFile.mockResolvedValue(undefined);

    await streamSegments({
      segmentUrls,
      baseStoragePath,
      options: { concurrencyLimit: 2 },
    });

    // Verify fetch was called for each segment
    expect(mockFetch).toHaveBeenCalledTimes(4);

    // Verify streamFile was called for each segment
    expect(mockStreamFile).toHaveBeenCalledTimes(4);
  });

  test('should use default concurrency limit when not specified', async () => {
    const segmentUrls = Array.from({ length: 5 }, (_, i) => `http://example.com/seg-${i + 1}.ts`);
    const mockBody = new ReadableStream();

    mockFetch.mockResolvedValue({
      ok: true,
      body: mockBody,
      status: 200,
      statusText: 'OK',
    } as unknown as Response);
    mockStreamFile.mockResolvedValue(undefined);

    await streamSegments({
      segmentUrls,
      baseStoragePath: 'videos/test',
    });

    expect(mockFetch).toHaveBeenCalledTimes(5);
    expect(mockStreamFile).toHaveBeenCalledTimes(5);
  });

  test('should log error and throw when segment streaming fails', async () => {
    const segmentUrls = ['http://example.com/seg-1.ts', 'http://example.com/seg-2.ts', 'http://example.com/seg-3.ts'];
    const baseStoragePath = 'videos/test';
    const mockBody = new ReadableStream();
    const error = new Error('Network error');

    // First segment succeeds, second fails
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        body: mockBody,
        status: 200,
        statusText: 'OK',
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        body: null,
      } as unknown as Response);

    mockStreamFile.mockResolvedValue(undefined);

    await expect(
      streamSegments({
        segmentUrls,
        baseStoragePath,
        options: { concurrencyLimit: 1 },
      })
    ).rejects.toThrow('Failed to fetch segment: 404 Not Found');

    expect(mockLogger.error).toHaveBeenCalledWith(
      {
        segmentUrl: 'http://example.com/seg-2.ts',
        error: new Error('Failed to fetch segment: 404 Not Found'),
      },
      'Failed to stream segment'
    );

    // Should have only processed up to the failing segment
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockStreamFile).toHaveBeenCalledTimes(1);
  });
});
