import { Readable } from 'node:stream';
import { CustomError } from 'src/utils/custom-error';
import { HTTP_ERRORS } from 'src/utils/error-codes';
import { fetchWithError } from 'src/utils/fetch';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { streamFile } from '../gcp-cloud-storage';
import { streamSubtitleFile } from './index';

// Mock dependencies
vi.mock('src/utils/fetch', () => ({
  fetchWithError: vi.fn(),
}));

vi.mock('../gcp-cloud-storage', () => ({
  streamFile: vi.fn(),
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

vi.mock('src/utils/custom-error', () => ({
  CustomError: vi.fn(
    class {
      constructor(message: string, options: object) {
        const error = new Error(message);
        Object.assign(error, options);
        return error;
      }
    },
  ),
}));

describe('Subtitle Helper', () => {
  const mockOptions = {
    url: 'https://example.com/subtitles/en.vtt',
    storagePath: 'subtitles/test/en.vtt',
    contentType: 'text/vtt',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should stream subtitle file successfully', async () => {
    // Mock fetch response
    const mockReadable = new ReadableStream();
    vi.mocked(fetchWithError).mockResolvedValue({
      body: mockReadable,
      statusText: 'OK',
      status: 200,
    } as Response);

    // Mock successful streamFile
    vi.mocked(streamFile).mockResolvedValue({
      name: 'subtitles/test/en.vtt',
      bucket: 'test-bucket',
      size: '1024',
      contentType: 'text/vtt',
    });

    const result = await streamSubtitleFile(mockOptions);

    // Verify fetch was called with the correct URL and a default browser UA
    expect(fetchWithError).toHaveBeenCalledWith(mockOptions.url, {
      headers: expect.objectContaining({ 'User-Agent': expect.any(String) }),
    });

    // Verify streamFile was called with the correct arguments
    expect(streamFile).toHaveBeenCalledWith({
      stream: expect.any(Readable),
      storagePath: mockOptions.storagePath,
      options: {
        contentType: mockOptions.contentType,
      },
    });

    // Verify the result
    expect(result).toEqual({
      name: 'subtitles/test/en.vtt',
      bucket: 'test-bucket',
      size: '1024',
      contentType: 'text/vtt',
    });
  });

  test('should merge customRequestHeaders into the fetch headers', async () => {
    const mockReadable = new ReadableStream();
    vi.mocked(fetchWithError).mockResolvedValue({
      body: mockReadable,
      statusText: 'OK',
      status: 200,
    } as Response);
    vi.mocked(streamFile).mockResolvedValue({
      name: 'subtitles/test/en.vtt',
      bucket: 'test-bucket',
    });

    await streamSubtitleFile({
      ...mockOptions,
      customRequestHeaders: { Referer: 'https://example.com/' },
    });

    expect(fetchWithError).toHaveBeenCalledWith(mockOptions.url, {
      headers: expect.objectContaining({
        'User-Agent': expect.any(String),
        Referer: 'https://example.com/',
      }),
    });
  });

  test('should throw error when response body is null', async () => {
    // Mock fetch response with null body
    vi.mocked(fetchWithError).mockResolvedValue({
      body: null,
      statusText: 'Not Found',
      status: 404,
    } as Response);

    // Verify the error is thrown with the correct properties
    await expect(streamSubtitleFile(mockOptions)).rejects.toMatchObject({
      message: 'Failed to fetch subtitle',
      errorCode: HTTP_ERRORS.EMPTY_RESPONSE,
      shouldRetry: false,
      context: {
        url: mockOptions.url,
        storagePath: mockOptions.storagePath,
        responseStatus: 'Not Found',
        statusCode: 404,
      },
    });

    // Verify streamFile was not called
    expect(streamFile).not.toHaveBeenCalled();
  });

  test('retries a transient fetch failure and then throws', async () => {
    vi.useFakeTimers();
    try {
      // A generic (non-CustomError) failure is treated as transient → retried.
      vi.mocked(fetchWithError).mockRejectedValue(new Error('Network error'));

      const promise = streamSubtitleFile(mockOptions);
      const assertion = expect(promise).rejects.toThrow('Network error');
      // Fast-forward the linear backoff between attempts.
      await vi.runAllTimersAsync();
      await assertion;

      // 4 attempts (default), then gives up; never reaches the upload.
      expect(fetchWithError).toHaveBeenCalledTimes(4);
      expect(streamFile).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  test('should use default content type when not provided', async () => {
    // Mock fetch response
    const mockReadable = new ReadableStream();
    vi.mocked(fetchWithError).mockResolvedValue({
      body: mockReadable,
      statusText: 'OK',
      status: 200,
    } as Response);

    // Mock successful streamFile
    vi.mocked(streamFile).mockResolvedValue({
      name: 'subtitles/test/en.vtt',
      bucket: 'test-bucket',
    });

    const options = { ...mockOptions, contentType: undefined };
    await streamSubtitleFile(options);

    // Verify default content type was used
    expect(streamFile).toHaveBeenCalledWith({
      stream: expect.any(Readable),
      storagePath: options.storagePath,
      options: {
        contentType: 'text/vtt', // Default value
      },
    });
  });
});
