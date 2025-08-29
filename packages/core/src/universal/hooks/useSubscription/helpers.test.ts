import { describe, expect, it, vi } from 'vitest';
import { createExponentialBackoff } from './helpers';

describe('Subscription Helpers', () => {
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
