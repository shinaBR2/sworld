import {
  ERROR_CODES,
  ERROR_CONFIG,
} from '@shinabr2/core/universal/errors/errorCodes';

const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

type ErrorSeverity = (typeof ERROR_SEVERITY)[keyof typeof ERROR_SEVERITY];

/**
 * @typedef {Object} ErrorOptions
 * @property {string} [errorCode] - Error code identifying the type of error.
 * @property {ErrorSeverity} [severity] - Severity level of the error.
 * @property {Record<string, unknown>} [context] - Additional context information for the error.
 * @property {string} [source] - Source of the error.
 * @property {Error | CustomError} [originalError] - Original error that was wrapped by this CustomError.
 */
interface ErrorOptions {
  errorCode?: string;
  severity?: ErrorSeverity;
  context?: Record<string, unknown>;
  source?: string;
  originalError?: Error | CustomError | unknown;
  shouldRetry?: boolean;
}

/**
 * @typedef {Object} ErrorContext
 * @property {string} source - Source of the error context.
 * @property {Record<string, unknown>} data - Additional data associated with the error context.
 * @property {number} [timestamp] - Timestamp of when the error context was created.
 */
interface ErrorContext {
  source: string;
  data: Record<string, unknown>;
  timestamp?: number;
}

/**
 * CustomError class extends the built-in Error class and provides additional functionality
 * for handling and categorizing errors in a more structured way.
 * @extends Error
 */
class CustomError extends Error {
  /**
   * Timestamp of when the error occurred.
   * @type {number}
   */
  public readonly timestamp: number;

  /**
   * Error code identifying the type of error.
   * @type {string}
   */
  public readonly errorCode: string;

  /**
   * Severity level of the error.
   * @type {ErrorSeverity}
   */
  public readonly severity: ErrorSeverity;

  /**
   * Determine the ability to retry the request or not
   * @type {boolean}
   */
  public readonly shouldRetry: boolean;

  /**
   * Array of error contexts providing additional information about the error.
   * @type {ErrorContext[]}
   */
  public readonly contexts: ErrorContext[];

  /**
   * Optional reference to the original error that was wrapped by this CustomError.
   * @type {Error}
   */
  public readonly originalError?: Error;

  public readonly userMessage: string;

  public readonly shouldNotify: boolean;

  /**
   * Constructs a new instance of CustomError.
   * @param {string} message - The error message.
   * @param {ErrorOptions} [options={}] - Additional options for the error.
   */
  constructor(message: string, options: ErrorOptions = {}) {
    super(message);

    const {
      errorCode = 'UNKNOWN_ERROR',
      severity = ERROR_SEVERITY.MEDIUM,
      context = {},
      source = 'Unknown',
      originalError,
      shouldRetry = false,
    } = options;

    this.name = 'CustomError';
    this.timestamp = Date.now();
    this.errorCode = errorCode;
    this.severity = severity;
    this.contexts = [];

    const errorConfig = ERROR_CONFIG[errorCode as keyof typeof ERROR_CONFIG];

    this.userMessage =
      errorConfig?.userMessage ??
      ERROR_CONFIG[ERROR_CODES.UNEXPECTED_ERROR].userMessage;
    this.shouldRetry = errorConfig?.shouldRetry ?? shouldRetry;
    this.shouldNotify = errorConfig?.shouldAlert ?? false;

    // If wrapping a CustomError
    if (originalError instanceof CustomError) {
      this.contexts = [
        {
          source,
          data: context,
          timestamp: Date.now(),
        },
        ...originalError.contexts,
      ];
      this.originalError = originalError.originalError;
      if (originalError.stack) {
        this.stack = originalError.stack;
      }

      if (originalError.shouldRetry) {
        this.shouldRetry = originalError.shouldRetry;
      }
    }
    // If wrapping a regular Error
    else if (originalError instanceof Error) {
      this.contexts = [
        {
          source,
          data: context,
          timestamp: Date.now(),
        },
        {
          source: 'OriginalError',
          data: {
            message: originalError.message,
            name: originalError.name,
            stack: originalError.stack,
          },
          timestamp: Date.now(),
        },
      ];
      this.originalError = originalError;
      if (originalError.stack) {
        this.stack = originalError.stack;
      }
    }
    // Basic error case
    else {
      this.contexts = [
        {
          source,
          data: context,
          timestamp: Date.now(),
        },
      ];
    }
  }

  /**
   * Creates a new CustomError instance with low severity.
   * @param {string} message - The error message.
   * @param {Omit<ErrorOptions, 'severity'>} [options={}] - Additional options for the error.
   * @returns {CustomError} The created CustomError instance.
   */
  static low(
    message: string,
    options: Omit<ErrorOptions, 'severity'> = {},
  ): CustomError {
    return new CustomError(message, {
      ...options,
      severity: ERROR_SEVERITY.LOW,
    });
  }

  /**
   * Creates a new CustomError instance with medium severity.
   * @param {string} message - The error message.
   * @param {Omit<ErrorOptions, 'severity'>} [options={}] - Additional options for the error.
   * @returns {CustomError} The created CustomError instance.
   */
  static medium(
    message: string,
    options: Omit<ErrorOptions, 'severity'> = {},
  ): CustomError {
    return new CustomError(message, {
      ...options,
      severity: ERROR_SEVERITY.MEDIUM,
    });
  }

  /**
   * Creates a new CustomError instance with high severity.
   * @param {string} message - The error message.
   * @param {Omit<ErrorOptions, 'severity'>} [options={}] - Additional options for the error.
   * @returns {CustomError} The created CustomError instance.
   */
  static high(
    message: string,
    options: Omit<ErrorOptions, 'severity'> = {},
  ): CustomError {
    return new CustomError(message, {
      ...options,
      severity: ERROR_SEVERITY.HIGH,
    });
  }

  /**
   * Creates a new CustomError instance with critical severity.
   * @param {string} message - The error message.
   * @param {Omit<ErrorOptions, 'severity'>} [options={}] - Additional options for the error.
   * @returns {CustomError} The created CustomError instance.
   */
  static critical(
    message: string,
    options: Omit<ErrorOptions, 'severity'> = {},
  ): CustomError {
    return new CustomError(message, {
      ...options,
      severity: ERROR_SEVERITY.CRITICAL,
    });
  }

  /**
   * Returns a flattened object representation of the error contexts.
   * @returns {Record<string, unknown>} The flattened error context object.
   */
  getFlattenedContext(): Record<string, unknown> {
    return this.contexts.reduce((acc: Record<string, unknown>, context) => {
      acc[`${context.source}_${context.timestamp ?? 'undefined'}`] =
        context.data;
      return acc;
    }, {});
  }

  toUserResponse() {
    return {
      message: this.userMessage,
      extensions: {
        code: this.errorCode,
        shouldRetry: this.shouldRetry,
      },
    };
  }
}

export { ERROR_SEVERITY, CustomError };
