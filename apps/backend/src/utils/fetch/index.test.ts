import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fetchWithError } from './index';
import { CustomError } from '../custom-error';
import { HTTP_ERRORS } from '../error-codes';

describe('fetchWithError', () => {
  const mockUrl = 'https://api.example.com/data';

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.AbortSignal = {
      timeout: vi.fn().mockReturnValue(new AbortController().signal),
    } as any;
  });

  it('should pass through fetch options', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    (fetch as Mock).mockResolvedValue(mockResponse);

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    };

    await fetchWithError(mockUrl, options);
    expect(fetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: expect.any(Object),
      }),
    );
  });

  it('should return response when fetch is successful', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    (fetch as Mock).mockResolvedValue(mockResponse);

    const response = await fetchWithError(mockUrl);
    expect(response).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({ signal: expect.any(Object) }),
    );
  });

  it('should throw retryable error for network failures', async () => {
    const networkError = new TypeError('Failed to fetch');
    (fetch as Mock).mockRejectedValue(networkError);

    await expect(fetchWithError(mockUrl)).rejects.toThrow(CustomError);
    try {
      await fetchWithError(mockUrl);
      throw new Error('Expected function to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).errorCode).toBe(HTTP_ERRORS.NETWORK_ERROR);
      expect((error as CustomError).shouldRetry).toBe(true);
    }
  });

  it('should throw retryable error for 5xx responses', async () => {
    const mockResponse = new Response('server error', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    (fetch as Mock).mockResolvedValue(mockResponse);

    await expect(fetchWithError(mockUrl)).rejects.toThrow(CustomError);
    try {
      await fetchWithError(mockUrl);
      throw new Error('Expected function to throw an error'); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).errorCode).toBe(HTTP_ERRORS.SERVER_ERROR);
      expect((error as CustomError).shouldRetry).toBe(true);
    }
  });

  it('should throw non-retryable error for 4xx responses', async () => {
    const mockResponse = new Response('not found', {
      status: 404,
      statusText: 'Not Found',
    });
    (fetch as Mock).mockResolvedValue(mockResponse);

    await expect(fetchWithError(mockUrl)).rejects.toThrow(CustomError);
    try {
      await fetchWithError(mockUrl);
      throw new Error('Expected function to throw an error'); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).errorCode).toBe(HTTP_ERRORS.CLIENT_ERROR);
      expect((error as CustomError).shouldRetry).toBe(false);
    }
  });

  it('should preserve CustomError if thrown from fetch', async () => {
    const customError = new CustomError('Custom error message', {
      errorCode: HTTP_ERRORS.SERVER_ERROR,
      shouldRetry: true,
    });
    (fetch as Mock).mockRejectedValue(customError);

    await expect(fetchWithError(mockUrl)).rejects.toThrow(CustomError);
    try {
      await fetchWithError(mockUrl);
      throw new Error('Expected function to throw an error'); // Should not reach here
    } catch (error) {
      expect(error).toBe(customError); // Should be the exact same error instance
      expect((error as CustomError).errorCode).toBe(HTTP_ERRORS.SERVER_ERROR);
      expect((error as CustomError).shouldRetry).toBe(true);
    }
  });

  it('should handle non-Error objects thrown by fetch', async () => {
    (fetch as Mock).mockRejectedValue('string error');

    await expect(fetchWithError(mockUrl)).rejects.toThrow(CustomError);
    try {
      await fetchWithError(mockUrl);
      throw new Error('Expected function to throw an error'); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).errorCode).toBe(HTTP_ERRORS.NETWORK_ERROR);
      expect((error as CustomError).shouldRetry).toBe(true);
    }
  });

  it('should throw retryable error for request timeout', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    (fetch as Mock).mockRejectedValue(abortError);

    await expect(fetchWithError(mockUrl, { timeout: 1000 })).rejects.toThrow(
      CustomError,
    );
    try {
      await fetchWithError(mockUrl, { timeout: 1000 });
      expect.fail('Expected timeout to trigger a CustomError');
    } catch (error) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).errorCode).toBe(HTTP_ERRORS.NETWORK_ERROR);
      expect((error as CustomError).shouldRetry).toBe(true);
      expect(error.message).toBe('Request timed out');
    }
  });
});
