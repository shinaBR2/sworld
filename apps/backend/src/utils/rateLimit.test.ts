import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  resetRateLimitStore,
  MAX_REQUESTS,
  WINDOW_MS,
} from './rateLimit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('should allow requests up to the limit', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(() => checkRateLimit('192.168.1.1', 'ext-id')).not.toThrow();
    }
  });

  it('should throw when rate limit is exceeded', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit('192.168.1.1', 'ext-id');
    }

    expect(() => checkRateLimit('192.168.1.1', 'ext-id')).toThrow(
      'rate_limit_exceeded',
    );
  });

  it('should track different IPs separately', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit('192.168.1.1', 'ext-id');
    }

    expect(() => checkRateLimit('192.168.2.1', 'ext-id')).not.toThrow();
  });

  it('should track different extension IDs separately', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit('192.168.1.1', 'ext-one');
    }

    expect(() => checkRateLimit('192.168.1.1', 'ext-two')).not.toThrow();
  });

  it('should reset the window after the time window expires', () => {
    const mockDate = new Date('2025-01-01T00:00:00Z');
    const spy = vi
      .spyOn(Date, 'now')
      .mockImplementation(() => mockDate.getTime());

    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit('192.168.1.1', 'ext-id');
    }

    expect(() => checkRateLimit('192.168.1.1', 'ext-id')).toThrow(
      'rate_limit_exceeded',
    );

    spy.mockImplementation(() => mockDate.getTime() + WINDOW_MS + 1);

    expect(() => checkRateLimit('192.168.1.1', 'ext-id')).not.toThrow();

    spy.mockRestore();
  });
});
