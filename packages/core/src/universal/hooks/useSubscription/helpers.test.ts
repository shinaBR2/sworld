import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../../error-boundary/app-error';
import { captureError } from '../../tracker';
import { SubscriptionErrorType, captureSubscriptionError, createExponentialBackoff } from './helpers';

// Mock the captureError function
vi.mock('../../tracker', () => ({
  captureError: vi.fn(),
}));

describe('Subscription Helpers', () => {
  describe('captureSubscriptionError', () => {
    const mockError = new AppError('Test error', 'Test error message', true);

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call captureError with basic error params', () => {
      captureSubscriptionError({
        error: mockError,
        type: SubscriptionErrorType.AUTHENTICATION_FAILED,
      });

      expect(captureError).toHaveBeenCalledWith(mockError, {
        tags: [
          { key: 'category', value: 'websocket' },
          { key: 'error_type', value: SubscriptionErrorType.AUTHENTICATION_FAILED },
        ],
        extras: {
          query: undefined,
          variables: undefined,
        },
        fingerprint: ['{{ default }}', 'useSubscription'],
      });
    });

    it('should include additional context when provided', () => {
      const additionalContext = {
        query: 'subscription Test { field }',
        variables: { id: 123 },
      };

      captureSubscriptionError({
        error: mockError,
        type: SubscriptionErrorType.DATA_PARSING_ERROR,
        additionalContext,
      });

      expect(captureError).toHaveBeenCalledWith(mockError, {
        tags: [
          { key: 'category', value: 'websocket' },
          { key: 'error_type', value: SubscriptionErrorType.DATA_PARSING_ERROR },
        ],
        extras: additionalContext,
        fingerprint: ['{{ default }}', 'useSubscription'],
      });
    });

    it('should handle empty additionalContext', () => {
      captureSubscriptionError({
        error: mockError,
        type: SubscriptionErrorType.NETWORK_ERROR,
        additionalContext: {},
      });

      expect(captureError).toHaveBeenCalledWith(mockError, {
        tags: [
          { key: 'category', value: 'websocket' },
          { key: 'error_type', value: SubscriptionErrorType.NETWORK_ERROR },
        ],
        extras: {
          query: undefined,
          variables: undefined,
        },
        fingerprint: ['{{ default }}', 'useSubscription'],
      });
    });
  });

  describe('createExponentialBackoff', () => {
    it('should use default values when no params provided', () => {
      const backoff = createExponentialBackoff();

      expect(backoff.shouldRetry()).toBe(true);

      // First delay should be between 1000 and 2000 (baseDelay * 2 * random)
      const firstDelay = backoff.getNextDelay();
      expect(firstDelay).toBeGreaterThanOrEqual(1000);
      expect(firstDelay).toBeLessThanOrEqual(2000);
    });

    it('should respect custom params', () => {
      const backoff = createExponentialBackoff({
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 2000,
      });

      expect(backoff.shouldRetry()).toBe(true);

      const firstDelay = backoff.getNextDelay();
      expect(firstDelay).toBeGreaterThanOrEqual(500);
      expect(firstDelay).toBeLessThanOrEqual(1000);
    });

    it('should handle maxRetries correctly', () => {
      const backoff = createExponentialBackoff({ maxRetries: 2 });

      expect(backoff.shouldRetry()).toBe(true); // 0 retries
      backoff.getNextDelay();

      expect(backoff.shouldRetry()).toBe(true); // 1 retry
      backoff.getNextDelay();

      expect(backoff.shouldRetry()).toBe(false); // 2 retries
    });

    it('should respect maxDelay', () => {
      const backoff = createExponentialBackoff({
        baseDelay: 1000,
        maxDelay: 2000,
      });

      // Even after multiple retries, delay should never exceed maxDelay
      for (let i = 0; i < 3; i++) {
        const delay = backoff.getNextDelay();
        expect(delay).toBeLessThanOrEqual(2000);
      }
    });

    it('should reset retry count', () => {
      const backoff = createExponentialBackoff({ maxRetries: 2 });

      backoff.getNextDelay(); // First retry
      backoff.getNextDelay(); // Second retry
      expect(backoff.shouldRetry()).toBe(false);

      backoff.reset();
      expect(backoff.shouldRetry()).toBe(true);
    });

    it('should increase delay exponentially', () => {
      const backoff = createExponentialBackoff({
        baseDelay: 100,
        maxDelay: 10000,
      });

      // Remove randomness for predictable testing
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const delay1 = backoff.getNextDelay();
      const delay2 = backoff.getNextDelay();
      const delay3 = backoff.getNextDelay();

      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
      expect(delay2).toBe(delay1 * 2);
      expect(delay3).toBe(delay2 * 2);

      vi.spyOn(Math, 'random').mockRestore();
    });
  });
});
