import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorHandler } from './index';
import { CustomError } from '../../utils/custom-error';
import * as logger from '../../utils/logger';
import { getContext } from 'hono/context-storage';
import { envConfig } from '../../utils/envConfig';

// Mock dependencies
vi.mock('hono/context-storage', () => ({
  getContext: vi.fn(),
}));

vi.mock('../../utils/logger', () => ({
  getCurrentLogger: vi.fn(),
}));

vi.mock('../../utils/envConfig', () => ({
  envConfig: {
    errorTracker: {
      posthogPublicKey: '',
      posthogHost: '',
    },
  },
}));

vi.mock('posthog-node', () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    captureException: vi.fn(),
    shutdown: vi.fn(),
  })),
}));

// Mock both import paths for @shinabr2/core
vi.mock('@shinabr2/core/universal/errors/errorCodes', () => ({
  ERROR_CODES: {
    UNEXPECTED_ERROR: 'unexpected-error',
    USER_ERROR: 'user-error',
    DB_OPERATION_FAILED: 'db-operation-failed',
  },
  ERROR_CONFIG: {
    'unexpected-error': {
      userMessage: 'An unexpected error occurred',
      shouldRetry: false,
      shouldAlert: true,
    },
    'user-error': {
      userMessage: 'User error occurred',
      shouldRetry: false,
      shouldAlert: false,
    },
    'db-operation-failed': {
      userMessage: 'Database operation failed',
      shouldRetry: true,
      shouldAlert: true,
    },
  },
}));

vi.mock('@shinabr2/core/dist/universal/errors/errorCodes', () => ({
  ERROR_CODES: {
    UNEXPECTED_ERROR: 'unexpected-error',
    USER_ERROR: 'user-error',
    DB_OPERATION_FAILED: 'db-operation-failed',
  },
  ERROR_CONFIG: {
    'unexpected-error': {
      userMessage: 'An unexpected error occurred',
      shouldRetry: false,
      shouldAlert: true,
    },
    'user-error': {
      userMessage: 'User error occurred',
      shouldRetry: false,
      shouldAlert: false,
    },
    'db-operation-failed': {
      userMessage: 'Database operation failed',
      shouldRetry: true,
      shouldAlert: true,
    },
  },
}));

describe('errorHandler', () => {
  let mockLogger: {
    debug: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };

    vi.mocked(logger.getCurrentLogger).mockReturnValue(mockLogger as any);
    vi.mocked(getContext).mockReturnValue({
      var: {
        userId: 'test-user-123',
        hasuraAction: 'createUser',
        hasuraEventTrigger: null,
      },
    } as any);
  });

  afterEach(() => {
    // Reset envConfig.errorTracker to prevent test pollution
    envConfig.errorTracker.posthogPublicKey = '';
    envConfig.errorTracker.posthogHost = '';
    vi.clearAllMocks();
  });

  describe('CustomError handling', () => {
    it('should handle CustomError with shouldNotify=true', () => {
      const error = new CustomError('Database connection failed', {
        errorCode: 'db-operation-failed',
      });

      const result = errorHandler(error);

      expect(mockLogger.error).toHaveBeenCalledWith({
        err: error,
        message: 'Database connection failed',
        metadata: {
          userId: 'test-user-123',
          hasuraAction: 'createUser',
          hasuraEventTrigger: null,
        },
      });

      expect(result).toEqual({
        result: {
          message: 'Database operation failed',
          extensions: {
            code: 'db-operation-failed',
            shouldRetry: true,
          },
        },
        statusCode: 400,
      });
    });

    it('should handle CustomError with shouldNotify=false', () => {
      const error = new CustomError('User validation failed', {
        errorCode: 'user-error',
      });

      const result = errorHandler(error);

      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(result).toEqual({
        result: {
          message: 'User error occurred',
          extensions: {
            code: 'user-error',
            shouldRetry: false,
          },
        },
        statusCode: 400,
      });
    });

    it('should log debug messages for CustomError', () => {
      const error = new CustomError('Test error', {
        errorCode: 'user-error',
      });

      errorHandler(error);

      expect(mockLogger.debug).toHaveBeenCalledWith('🎯 shouldRetry: false');
      expect(mockLogger.debug).toHaveBeenCalledWith('🎯 Status code: 400');
    });

    it('should include context metadata in error logs', () => {
      vi.mocked(getContext).mockReturnValue({
        var: {
          userId: 'user-456',
          hasuraAction: null,
          hasuraEventTrigger: 'user_created',
        },
      } as any);

      const error = new CustomError('Event processing failed', {
        errorCode: 'db-operation-failed',
      });

      errorHandler(error);

      expect(mockLogger.error).toHaveBeenCalledWith({
        err: error,
        message: 'Event processing failed',
        metadata: {
          userId: 'user-456',
          hasuraAction: null,
          hasuraEventTrigger: 'user_created',
        },
      });
    });

    it('should handle CustomError when context is undefined', () => {
      vi.mocked(getContext).mockReturnValue(undefined as any);

      const error = new CustomError('Test error', {
        errorCode: 'user-error',
      });

      const result = errorHandler(error);

      expect(result).toEqual({
        result: {
          message: 'User error occurred',
          extensions: {
            code: 'user-error',
            shouldRetry: false,
          },
        },
        statusCode: 400,
      });
    });
  });

  describe('PostHog integration', () => {
    beforeEach(() => {
      // Reset PostHog mock before each test
      vi.clearAllMocks();
    });

    it('should send error to PostHog when configured and shouldNotify is false', async () => {
      const { PostHog } = await import('posthog-node');
      const mockPostHog = {
        captureException: vi.fn(),
        shutdown: vi.fn(),
      };
      vi.mocked(PostHog)
        .mockClear()
        .mockImplementation(() => mockPostHog as any);

      // Enable PostHog
      envConfig.errorTracker.posthogPublicKey = 'test-key';
      envConfig.errorTracker.posthogHost = 'https://posthog.example.com';

      // Use user-error which has shouldNotify=false
      const error = new CustomError('Test error', {
        errorCode: 'user-error',
      });

      errorHandler(error);

      expect(PostHog).toHaveBeenCalledWith('test-key', {
        host: 'https://posthog.example.com',
      });
      expect(mockPostHog.captureException).toHaveBeenCalledWith(
        error,
        'test-user-123',
      );
      expect(mockPostHog.shutdown).toHaveBeenCalled();
    });

    it('should handle PostHog errors gracefully', async () => {
      const { PostHog } = await import('posthog-node');
      const posthogError = new Error('PostHog connection failed');
      vi.mocked(PostHog)
        .mockClear()
        .mockImplementation(() => {
          throw posthogError;
        });

      envConfig.errorTracker.posthogPublicKey = 'test-key';
      envConfig.errorTracker.posthogHost = 'https://posthog.example.com';

      // Use user-error which has shouldNotify=false
      const error = new CustomError('Test error', {
        errorCode: 'user-error',
      });

      const result = errorHandler(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        posthogError,
        'Failed to send error to PostHog',
      );
      expect(result).toEqual({
        result: {
          message: 'User error occurred',
          extensions: {
            code: 'user-error',
            shouldRetry: false,
          },
        },
        statusCode: 400,
      });
    });

    it('should not call PostHog when not configured', async () => {
      const { PostHog } = await import('posthog-node');
      vi.mocked(PostHog).mockClear();

      envConfig.errorTracker.posthogPublicKey = '';
      envConfig.errorTracker.posthogHost = '';

      const error = new CustomError('Test error', {
        errorCode: 'user-error',
      });

      errorHandler(error);

      expect(PostHog).not.toHaveBeenCalled();
    });

    it('should not call PostHog when shouldNotify is true', async () => {
      const { PostHog } = await import('posthog-node');
      vi.mocked(PostHog).mockClear();

      envConfig.errorTracker.posthogPublicKey = 'test-key';
      envConfig.errorTracker.posthogHost = 'https://posthog.example.com';

      // Use db-operation-failed which has shouldNotify=true
      const error = new CustomError('Test error', {
        errorCode: 'db-operation-failed',
      });

      errorHandler(error);

      // PostHog should not be called when shouldNotify is true
      expect(PostHog).not.toHaveBeenCalled();
    });
  });

  describe('Native Error handling', () => {
    it('should handle native Error objects', () => {
      const error = new Error('Unexpected database error');

      const result = errorHandler(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          err: error,
          message: 'Unexpected database error',
          metadata: {
            userId: 'test-user-123',
            hasuraAction: 'createUser',
            hasuraEventTrigger: null,
          },
        },
        'Unexpected error',
      );

      expect(result).toEqual({
        result: {
          message: 'Unexpected database error',
          extensions: {
            code: 'unexpected-error',
            shouldRetry: true,
          },
        },
        statusCode: 400,
      });
    });

    it('should set shouldRetry=true for native errors', () => {
      const error = new Error('Some error');

      const result = errorHandler(error);

      expect(
        'extensions' in result.result && result.result.extensions.shouldRetry,
      ).toBe(true);
    });

    it('should return 400 status code for native errors', () => {
      const error = new Error('Some error');

      const result = errorHandler(error);

      expect(result.statusCode).toBe(400);
    });
  });

  describe('Non-Error object handling', () => {
    it('should handle non-Error objects as developer mistakes', () => {
      const nonError = 'This is a string error';

      const result = errorHandler(nonError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(Error),
        'Developer mistake',
      );

      const loggedError = mockLogger.error.mock.calls[0][0];
      expect(loggedError.message).toBe('Developer mistake');

      expect(result).toEqual({
        result: {
          error: 'Internal Server Error',
          message: 'Developer mistake',
        },
        statusCode: 200,
      });
    });

    it('should return 200 status code to prevent retry for developer mistakes', () => {
      const nonError = { some: 'object' };

      const result = errorHandler(nonError);

      expect(result.statusCode).toBe(200);
    });

    it('should handle null as developer mistake', () => {
      const result = errorHandler(null);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(Error),
        'Developer mistake',
      );
      expect(result.statusCode).toBe(200);
    });

    it('should handle undefined as developer mistake', () => {
      const result = errorHandler(undefined);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(Error),
        'Developer mistake',
      );
      expect(result.statusCode).toBe(200);
    });
  });

  describe('Edge cases', () => {
    it('should handle CustomError with missing context gracefully', () => {
      vi.mocked(getContext).mockReturnValue(null as any);

      const error = new CustomError('Test error', {
        errorCode: 'user-error',
      });

      const result = errorHandler(error);

      expect(result).toBeDefined();
      expect(result.statusCode).toBe(400);
    });

    it('should handle CustomError with partial context', () => {
      vi.mocked(getContext).mockReturnValue({
        var: {
          userId: undefined,
          hasuraAction: undefined,
          hasuraEventTrigger: undefined,
        },
      } as any);

      const error = new CustomError('Test error', {
        errorCode: 'db-operation-failed',
      });

      errorHandler(error);

      expect(mockLogger.error).toHaveBeenCalledWith({
        err: error,
        message: 'Test error',
        metadata: {
          userId: undefined,
          hasuraAction: undefined,
          hasuraEventTrigger: undefined,
        },
      });
    });

    it('should handle Error subclasses', () => {
      class CustomNativeError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomNativeError';
        }
      }

      const error = new CustomNativeError('Custom native error');

      const result = errorHandler(error);

      expect(result.result.message).toBe('Custom native error');
      if ('extensions' in result.result) {
        expect(result.result.extensions.code).toBe('unexpected-error');
      }
      expect(result.statusCode).toBe(400);
    });
  });
});
