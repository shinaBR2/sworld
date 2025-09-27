import { Readable } from 'node:stream';
import { CustomError } from 'src/utils/custom-error';
import { HTTP_ERRORS } from 'src/utils/error-codes';
import { fetchWithError } from 'src/utils/fetch';
import { logger } from 'src/utils/logger';
import { systemConfig } from 'src/utils/systemConfig';
import { type Mock, beforeEach, describe, expect, test, vi } from 'vitest';
import { downloadFile, verifyFileSize } from '../file';
import { streamFile } from '../gcp-cloud-storage';
import {
  downloadSegments,
  parseM3U8Content,
  streamPlaylistFile,
  streamSegmentFile,
  streamSegments,
} from './helpers';

vi.mock('src/utils/fetch', () => ({
  fetchWithError: vi.fn(),
}));

vi.mock('../gcp-cloud-storage', () => ({
  streamFile: vi.fn(),
}));

vi.mock('src/utils/custom-error', () => ({
  CustomError: vi.fn().mockImplementation((message, options) => {
    const error = new Error(message);
    Object.assign(error, { message, ...options });
    throw error; // Need to throw the error
  }),
}));
vi.mock('../file', () => ({
  downloadFile: vi.fn(),
  verifyFileSize: vi.fn(),
}));

vi.mock('src/utils/logger', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };

  return {
    logger: mockLogger,
    getCurrentLogger: vi.fn(() => mockLogger),
  };
});

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
    expect(downloadFile).toHaveBeenCalledWith(
      'https://example.com/segment1.ts',
      '/tmp/test/segment1.ts',
    );
    expect(logger.info).toHaveBeenCalledWith(
      {
        segmentName: 'segment1.ts',
        segmentUrl: 'https://example.com/segment1.ts',
      },
      'Downloading segment',
    );
  });

  test('should verify file size when maxSegmentSize is provided', async () => {
    const maxSize = 1024;
    await downloadSegments(mockSegments, mockTempDir, maxSize);

    expect(verifyFileSize).toHaveBeenCalledTimes(3);
    expect(verifyFileSize).toHaveBeenCalledWith(
      '/tmp/test/segment1.ts',
      maxSize,
    );
  });

  test('should process segments in batches of 5', async () => {
    const sixSegments = Array(6)
      .fill('')
      .map((_, i) => `https://example.com/segment${i + 1}.ts`);

    await downloadSegments(sixSegments, mockTempDir);

    const downloadCalls = vi.mocked(downloadFile).mock.calls;
    // Verify first batch (5 segments)
    const firstBatch = downloadCalls.slice(0, 5);
    expect(firstBatch.map((call) => call[0])).toEqual([
      'https://example.com/segment1.ts',
      'https://example.com/segment2.ts',
      'https://example.com/segment3.ts',
      'https://example.com/segment4.ts',
      'https://example.com/segment5.ts',
    ]);
    // Verify second batch (1 segment)
    const secondBatch = downloadCalls.slice(5);
    expect(secondBatch.map((call) => call[0])).toEqual([
      'https://example.com/segment6.ts',
    ]);
  });

  test('when error with promise.all', async () => {
    vi.mocked(downloadFile).mockRejectedValueOnce(new Error('Download failed'));

    await expect(downloadSegments(mockSegments, mockTempDir)).rejects.toThrow(
      'Download failed',
    );

    expect(downloadFile).toHaveBeenCalledTimes(3);
  });
});

describe('streamSegmentFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const testUrl = 'http://example.com/segment.ts';
  const testPath = 'test-path/segment.ts';

  test('should download and stream segment file', async () => {
    // Mock successful fetch response
    const mockBody = new ReadableStream();
    (fetchWithError as Mock).mockResolvedValue({
      body: mockBody,
      statusText: 'OK',
    } as Response);

    await streamSegmentFile(
      'http://example.com/segment.ts',
      'test-path/segment.ts',
    );

    // Verify fetch was called with correct URL
    expect(fetchWithError).toHaveBeenCalledWith(
      'http://example.com/segment.ts',
      {
        timeout: systemConfig.defaultExternalRequestTimeout,
      },
    );

    // Verify streamFile was called with correct arguments
    const streamFileCall = (streamFile as Mock).mock.calls[0][0];
    expect(streamFileCall.stream).toBeInstanceOf(Readable);
    expect(streamFileCall.storagePath).toBe('test-path/segment.ts');
    expect(streamFileCall.options.contentType).toBe('video/MP2T');
  });

  test('should throw error when fetch fails', async () => {
    const mockResponse = {
      body: null,
      statusText: 'Not Found',
      status: 404,
    } as Response;
    (fetchWithError as Mock).mockResolvedValue(mockResponse);
    await expect(streamSegmentFile(testUrl, testPath)).rejects.toThrow();

    expect(CustomError).toHaveBeenCalledWith('Failed to fetch segment', {
      errorCode: HTTP_ERRORS.EMPTY_RESPONSE,
      shouldRetry: false,
      context: {
        segmentUrl: testUrl,
        storagePath: testPath,
        responseStatus: mockResponse.statusText,
        statusCode: mockResponse.status,
      },
    });
    expect(streamFile).not.toHaveBeenCalled();
  });

  test('should throw error when response body is null', async () => {
    const mockResponse = {
      body: null,
      statusText: 'Internal Server Error',
      status: 500,
    } as Response;
    (fetchWithError as Mock).mockResolvedValue(mockResponse);
    await expect(streamSegmentFile(testUrl, testPath)).rejects.toThrow();

    expect(CustomError).toHaveBeenCalledWith('Failed to fetch segment', {
      errorCode: HTTP_ERRORS.EMPTY_RESPONSE,
      shouldRetry: false,
      context: {
        segmentUrl: testUrl,
        storagePath: testPath,
        responseStatus: mockResponse.statusText,
        statusCode: mockResponse.status,
      },
    });

    expect(streamFile).not.toHaveBeenCalled();
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
    const content =
      '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=1280x720\npath/with/special-chars.ts';
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
    await expect(streamPlaylistFile(content, storagePath)).rejects.toThrow(
      'Stream error',
    );

    expect(mockStreamFile).toHaveBeenCalledOnce();
  });
});

describe('streamSegments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should process segments in batches based on concurrency limit', async () => {
    const segments = [
      { url: 'http://example.com/seg-1.ts', name: '0.ts' },
      { url: 'http://example.com/seg-2.ts', name: '1.ts' },
      { url: 'http://example.com/seg-3.ts', name: '2.ts' },
      { url: 'http://example.com/seg-4.ts', name: '3.ts' },
    ];
    const baseStoragePath = 'videos/test';

    // Mock successful fetch responses - create new stream each time
    (fetchWithError as Mock).mockImplementation(() =>
      Promise.resolve({
        body: new ReadableStream(),
        statusText: 'OK',
      } as Response),
    );

    // Mock successful streamFile responses
    (streamFile as Mock).mockResolvedValue(undefined);

    await streamSegments({
      segments,
      baseStoragePath,
      options: { concurrencyLimit: 2 },
    });

    // Verify fetch was called for each segment
    expect(fetchWithError).toHaveBeenCalledTimes(4);

    // Verify streamFile was called for each segment with correct args
    expect(streamFile).toHaveBeenCalledTimes(4);
    const streamFileCalls = (streamFile as Mock).mock.calls;
    streamFileCalls.forEach((call, index) => {
      expect(call[0].stream).toBeInstanceOf(Readable);
      expect(call[0].storagePath).toBe(`videos/test/${index}.ts`);
      expect(call[0].options.contentType).toBe('video/MP2T');
    });
  });

  test('should use default concurrency limit when not specified', async () => {
    const segments = Array.from({ length: 5 }, (_, i) => ({
      url: `http://example.com/seg-${i + 1}.ts`,
      name: `${i}.ts`,
    }));

    (fetchWithError as Mock).mockImplementation(() =>
      Promise.resolve({
        body: new ReadableStream(),
        statusText: 'OK',
      } as Response),
    );
    (streamFile as Mock).mockResolvedValue(undefined);

    await streamSegments({
      segments,
      baseStoragePath: 'videos/test',
    });

    expect(fetchWithError).toHaveBeenCalledTimes(5);
    expect(streamFile).toHaveBeenCalledTimes(5);
  });

  test('should log error and throw when segment streaming fails', async () => {
    const segments = [
      { url: 'http://example.com/seg-1.ts', name: '0.ts' },
      { url: 'http://example.com/seg-2.ts', name: '1.ts' },
      { url: 'http://example.com/seg-3.ts', name: '2.ts' },
    ];
    const baseStoragePath = 'videos/test';
    const mockBody = new ReadableStream();

    // First segment succeeds, second fails
    (fetchWithError as Mock)
      .mockResolvedValueOnce({
        body: mockBody,
        statusText: 'OK',
      } as Response)
      .mockResolvedValueOnce({
        body: null,
        statusText: 'Not Found',
      } as Response);

    (streamFile as Mock).mockResolvedValue(undefined);

    await expect(
      streamSegments({
        segments,
        baseStoragePath,
        options: { concurrencyLimit: 1 },
      }),
    ).rejects.toThrow('Failed to fetch segment');

    // Should have only processed up to the failing segment
    expect(fetchWithError).toHaveBeenCalledTimes(2);
    expect(streamFile).toHaveBeenCalledTimes(1);
  });
});
