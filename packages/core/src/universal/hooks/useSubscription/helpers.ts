export enum SubscriptionErrorType {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  CONNECTION_INIT_FAILED = 'CONNECTION_INIT_FAILED',
  CONNECTION_CLOSED = 'CONNECTION_CLOSED',
  CLEANUP_ERROR = 'CLEANUP_ERROR',
  SUBSCRIPTION_START_FAILED = 'SUBSCRIPTION_START_FAILED',
  DATA_PARSING_ERROR = 'DATA_PARSING_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

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

export { createExponentialBackoff };
