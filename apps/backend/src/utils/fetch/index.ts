import { CustomError } from '../custom-error';
import { HTTP_ERRORS } from '../error-codes';

/**
 * Fetches a resource with enhanced error handling and timeout support.
 *
 * @param url - The URL to fetch
 * @param options - Fetch options with optional timeout
 * @param options.timeout - Timeout in milliseconds (default: 5000)
 * @returns Promise resolving to the fetch Response
 * @throws {CustomError} with appropriate error codes:
 *  - HTTP_ERRORS.SERVER_ERROR for 5xx responses (retryable)
 *  - HTTP_ERRORS.CLIENT_ERROR for 4xx responses (non-retryable)
 *  - HTTP_ERRORS.NETWORK_ERROR for network failures (retryable)
 */
const fetchWithError = async (
  url: string,
  options?: RequestInit & { timeout?: number },
): Promise<Response> => {
  const { timeout = 5000, ...fetchOptions } = options || {};

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: AbortSignal.timeout(timeout),
    });

    if (response.status >= 500) {
      throw new CustomError(`Server error: ${response.statusText}`, {
        errorCode: HTTP_ERRORS.SERVER_ERROR,
        shouldRetry: true,
        context: { url },
      });
    }

    if (!response.ok) {
      throw new CustomError(`Client error: ${response.statusText}`, {
        errorCode: HTTP_ERRORS.CLIENT_ERROR,
        shouldRetry: false,
        context: { url },
      });
    }

    return response;
  } catch (error) {
    // If it's already a CustomError, pass it through
    if (error instanceof CustomError) {
      throw error;
    }

    // Handle timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      throw new CustomError('Request timed out', {
        errorCode: HTTP_ERRORS.NETWORK_ERROR,
        shouldRetry: true,
        context: { url },
      });
    }

    // Network errors are always retryable
    throw new CustomError('Network error while fetching', {
      originalError: error as Error,
      errorCode: HTTP_ERRORS.NETWORK_ERROR,
      shouldRetry: true,
      context: { url },
    });
  }
};

export { fetchWithError };
