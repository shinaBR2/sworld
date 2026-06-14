import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomError } from 'src/utils/custom-error';
import { isRetryableError, withRetry } from './withRetry';

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

describe('withRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the result without retrying on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    const result = await withRetry(fn, { label: 'op', delayMs: 0 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries a transient failure and then succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('socket closed'))
      .mockResolvedValueOnce('ok');

    const result = await withRetry(fn, { label: 'op', delayMs: 0 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting attempts on a persistent failure', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('still down'));

    await expect(
      withRetry(fn, { label: 'op', attempts: 3, delayMs: 0 }),
    ).rejects.toThrow('still down');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry a non-retryable error (fails fast)', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('client error'));

    await expect(
      withRetry(fn, { label: 'op', delayMs: 0, isRetryable: () => false }),
    ).rejects.toThrow('client error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('handles a non-Error rejection value when logging a retry', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce('string failure')
      .mockResolvedValueOnce('ok');

    const result = await withRetry(fn, { label: 'op', delayMs: 0 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('isRetryableError', () => {
  it('treats a non-CustomError as retryable', () => {
    expect(isRetryableError(new Error('socket closed'))).toBe(true);
  });

  it('respects CustomError.shouldRetry', () => {
    const retryable = new CustomError('5xx', {
      errorCode: 'SERVER_ERROR',
      shouldRetry: true,
    });
    const nonRetryable = new CustomError('4xx', {
      errorCode: 'CLIENT_ERROR',
      shouldRetry: false,
    });

    expect(isRetryableError(retryable)).toBe(true);
    expect(isRetryableError(nonRetryable)).toBe(false);
  });
});
