import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTracker } from './index';
import { useRollbar } from '@rollbar/react';
import { AppError } from '../error-boundary/app-error';

// Mock the Rollbar hook
vi.mock('@rollbar/react', () => ({
  useRollbar: vi.fn(),
}));

describe('useTracker', () => {
  const mockError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup the mock implementation for useRollbar
    vi.mocked(useRollbar).mockReturnValue({
      error: mockError,
    });
  });

  it('should return captureError function', () => {
    const { result } = renderHook(() => useTracker());

    expect(result.current).toHaveProperty('captureError');
    expect(typeof result.current.captureError).toBe('function');
  });

  it('should call rollbar.error with correct parameters', () => {
    const { result } = renderHook(() => useTracker());

    const appError = new AppError('Test error');
    result.current.captureError(appError);

    expect(mockError).toHaveBeenCalledWith(appError.errorMessage, appError, {
      tags: [],
      extras: {},
      fingerprint: ['{{ default }}'],
    });
  });

  it('should pass custom tags, extras, and fingerprint to rollbar', () => {
    const { result } = renderHook(() => useTracker());

    const appError = new AppError('Custom error');
    const options = {
      tags: [
        { key: 'category', value: 'api' },
        { key: 'severity', value: 'high' },
      ],
      extras: {
        url: 'https://api.example.com',
        statusCode: 500,
      },
      fingerprint: ['custom-group-123'],
    };

    result.current.captureError(appError, options);

    expect(mockError).toHaveBeenCalledWith(appError.errorMessage, appError, {
      tags: options.tags,
      extras: options.extras,
      fingerprint: options.fingerprint,
    });
  });

  it('should use partial options with defaults for missing properties', () => {
    const { result } = renderHook(() => useTracker());

    const appError = new AppError('Partial options error');
    // Only provide tags but not extras or fingerprint
    result.current.captureError(appError, {
      tags: [{ key: 'source', value: 'test' }],
    });

    expect(mockError).toHaveBeenCalledWith(appError.errorMessage, appError, {
      tags: [{ key: 'source', value: 'test' }],
      extras: {},
      fingerprint: ['{{ default }}'],
    });
  });
});
