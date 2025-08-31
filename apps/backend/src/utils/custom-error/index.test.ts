import { describe, it, expect } from 'vitest';
import { CustomError, ERROR_SEVERITY } from './index';

describe('CustomError', () => {
  it('should create an error with default values', () => {
    const error = new CustomError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.name).toBe('CustomError');
    expect(error.errorCode).toBe('UNKNOWN_ERROR');
    expect(error.severity).toBe('medium');
    expect(error.shouldRetry).toBe(false);
    expect(error.contexts).toHaveLength(1);
    expect(error.contexts[0].source).toBe('Unknown');
    expect(error.timestamp).toBeDefined();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CustomError);
  });

  it('should create an error with custom options', () => {
    const originalError = new Error('Original error');
    const context = { userId: 123 };

    const error = new CustomError('Specific error', {
      errorCode: 'USER_ERROR',
      severity: 'high',
      context,
      source: 'UserService',
      originalError,
      shouldRetry: true,
    });

    expect(error.message).toBe('Specific error');
    expect(error.errorCode).toBe('USER_ERROR');
    expect(error.severity).toBe('high');
    expect(error.shouldRetry).toBe(true);
    expect(error.contexts).toHaveLength(2);
    expect(error.contexts[0].source).toBe('UserService');
    expect(error.contexts[0].data).toEqual({ userId: 123 });
    expect(error.contexts[1].source).toBe('OriginalError');
    expect(error.originalError).toBe(originalError);
  });

  it('should preserve original error stack trace', () => {
    const originalError = new Error('Original error');
    const error = new CustomError('Stack trace test', { originalError });

    expect(error.stack).toBe(originalError.stack);
  });

  it('should have a timestamp', () => {
    const error = new CustomError('Timestamp test');

    expect(error.timestamp).toBeTypeOf('number');
    expect(error.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('should work with instanceof checks', () => {
    const error = new CustomError('Instance check');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof CustomError).toBe(true);
  });

  describe('Static severity methods', () => {
    it('should create errors with different severity levels', () => {
      const lowError = CustomError.low('Low severity');
      const mediumError = CustomError.medium('Medium severity');
      const highError = CustomError.high('High severity');
      const criticalError = CustomError.critical('Critical severity');

      expect(lowError.severity).toBe(ERROR_SEVERITY.LOW);
      expect(mediumError.severity).toBe(ERROR_SEVERITY.MEDIUM);
      expect(highError.severity).toBe(ERROR_SEVERITY.HIGH);
      expect(criticalError.severity).toBe(ERROR_SEVERITY.CRITICAL);
    });
  });

  describe('getFlattenedContext', () => {
    it('should flatten contexts correctly', () => {
      const error = new CustomError('Flattened context test', {
        context: { userId: 123 },
        source: 'TestSource',
      });

      const flattenedContext = error.getFlattenedContext();
      const contextKeys = Object.keys(flattenedContext);

      expect(contextKeys).toHaveLength(1);
      expect(contextKeys[0]).toMatch(/^TestSource_\d+$/);
      expect(flattenedContext[contextKeys[0]]).toEqual({ userId: 123 });
    });

    it('should handle multiple contexts', () => {
      const originalError = new Error('Original error');
      const error = new CustomError('Multiple contexts', {
        context: { userId: 123 },
        source: 'UserService',
        originalError,
      });

      const flattenedContext = error.getFlattenedContext();
      const contextKeys = Object.keys(flattenedContext);

      expect(contextKeys).toHaveLength(2);
      expect(contextKeys[0]).toMatch(/^UserService_\d+$/);
      expect(contextKeys[1]).toMatch(/^OriginalError_\d+$/);
    });
  });

  describe('CustomError Propagation', () => {
    // Simulate a low-level service function that might throw an error
    const lowLevelOperation = () => {
      throw new Error('Database connection failed');
    };

    // Simulate a mid-level service function that wraps and transforms errors
    const midLevelService = () => {
      try {
        lowLevelOperation();
      } catch (error) {
        throw new CustomError('Failed to perform database operation', {
          errorCode: 'DB_OPERATION_FAILED',
          severity: ERROR_SEVERITY.HIGH,
          context: {
            service: 'UserService',
            method: 'createUser',
          },
          source: 'DatabaseLayer',
          originalError: error as Error,
        });
      }
    };

    // Simulate a high-level function that further wraps errors
    const highLevelController = () => {
      try {
        midLevelService();
      } catch (error) {
        throw new CustomError('User creation failed', {
          errorCode: 'USER_CREATION_FAILED',
          severity: ERROR_SEVERITY.CRITICAL,
          context: {
            userId: '123',
            requestId: 'req-456',
          },
          source: 'UserController',
          originalError: error as CustomError,
        });
      }
    };

    it('should propagate errors through multiple layers without circular references', () => {
      try {
        highLevelController();
      } catch (err) {
        const error = err as CustomError;
        // Verify it's a CustomError
        expect(error).toBeInstanceOf(CustomError);

        // Check the top-level error properties
        expect(error.message).toBe('User creation failed');
        expect(error.errorCode).toBe('USER_CREATION_FAILED');
        expect(error.severity).toBe(ERROR_SEVERITY.CRITICAL);

        // Verify contexts
        expect(error.contexts).toHaveLength(3); // High-level, Mid-level, Original error

        // Check context details
        const [controllerContext, databaseContext, originalErrorContext] =
          error.contexts;

        // High-level context
        expect(controllerContext.source).toBe('UserController');
        expect(controllerContext.data).toEqual({
          userId: '123',
          requestId: 'req-456',
        });

        // Mid-level context
        expect(databaseContext.source).toBe('DatabaseLayer');
        expect(databaseContext.data).toEqual({
          service: 'UserService',
          method: 'createUser',
        });

        // Original error context
        expect(originalErrorContext.source).toBe('OriginalError');
        expect(originalErrorContext.data.message).toBe(
          'Database connection failed',
        );

        // Verify no circular reference
        expect(error.originalError).not.toBeInstanceOf(CustomError);
        expect(error.originalError).toBeInstanceOf(Error);
      }
    });

    it('should preserve shouldRetry through error propagation', () => {
      const lowLevelError = new CustomError('Low level error', {
        shouldRetry: true,
      });
      const midLevelError = new CustomError('Mid level error', {
        originalError: lowLevelError,
      });
      const highLevelError = new CustomError('High level error', {
        originalError: midLevelError,
      });

      expect(highLevelError.shouldRetry).toBe(true);
    });
  });
});
