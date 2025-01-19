import { AppError } from '../../error-boundary/app-error';
import { captureError } from '../../tracker';

export enum SubscriptionErrorType {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  CONNECTION_INIT_FAILED = 'CONNECTION_INIT_FAILED',
  SUBSCRIPTION_START_FAILED = 'SUBSCRIPTION_START_FAILED',
  DATA_PARSING_ERROR = 'DATA_PARSING_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

interface CaptureSubscriptionErrorParams {
  error: AppError;
  type: string;
  additionalContext?: {
    query?: string;
    variables?: Record<string, unknown>;
  };
}

const captureSubscriptionError = (params: CaptureSubscriptionErrorParams) => {
  const { error, type, additionalContext } = params;

  captureError(error, {
    tags: [
      { key: 'category', value: 'websocket' },
      { key: 'error_type', value: type },
    ],
    extras: {
      query: additionalContext?.query,
      variables: additionalContext?.variables,
    },
    fingerprint: ['{{ default }}', 'useSubscription'],
  });
};

interface CreateExponentialBackoffParams {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

const createExponentialBackoff = (params?: CreateExponentialBackoffParams) => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 5000 } = params || {};
  let retryCount = 0;

  return {
    shouldRetry: () => retryCount < maxRetries,
    getNextDelay: () => {
      const delay = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount) * (1 + Math.random()));
      retryCount++;
      return delay;
    },
    reset: () => {
      retryCount = 0;
    },
  };
};

export { captureSubscriptionError, createExponentialBackoff };
