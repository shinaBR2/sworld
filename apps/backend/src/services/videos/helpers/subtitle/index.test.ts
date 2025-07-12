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

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('src/utils/custom-error', () => ({
  CustomError: vi.fn().mockImplementation((message, options) => {
    const error = new Error(message);
    Object.assign(error, options);
    return error;
  }),
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

    // Verify fetch was called with the correct URL
    expect(fetchWithError).toHaveBeenCalledWith(mockOptions.url);

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

  test('should throw error when fetch fails', async () => {
    // Mock fetch error
    const mockError = new Error('Network error');
    vi.mocked(fetchWithError).mockRejectedValue(mockError);

    await expect(streamSubtitleFile(mockOptions)).rejects.toThrow('Network error');

    // Verify streamFile was not called
    expect(streamFile).not.toHaveBeenCalled();
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
