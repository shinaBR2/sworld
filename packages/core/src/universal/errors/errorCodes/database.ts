import { SEVERITY } from './severity';
import type { ErrorMap } from './types';

const DATABASE_ERROR_CODES = {
  INCONSISTENT_DATA: 'DB_3001',
  QUERY_TIMEOUT: 'DB_3002',
  CONSTRAINT_VIOLATION: 'DB_3003',
  RECORD_NOT_FOUND: 'DB_3004',
  DUPLICATE_ENTRY: 'DB_3005',
  TRANSACTION_FAILED: 'DB_3006',
} as const;

const DATABASE_ERRORS: ErrorMap<typeof DATABASE_ERROR_CODES> = {
  [DATABASE_ERROR_CODES.INCONSISTENT_DATA]: {
    shouldAlert: true,
    shouldRetry: false,
    severity: SEVERITY.CRITICAL,
    userMessage: 'Data inconsistency detected. We are working on it.',
  },
  [DATABASE_ERROR_CODES.QUERY_TIMEOUT]: {
    shouldAlert: false,
    shouldRetry: true,
    severity: SEVERITY.HIGH,
    userMessage: 'Request is taking longer than expected. Please try again.',
  },
  [DATABASE_ERROR_CODES.CONSTRAINT_VIOLATION]: {
    shouldAlert: false,
    shouldRetry: false,
    severity: SEVERITY.MEDIUM,
    userMessage: 'Data validation error. Please check your input.',
  },
  [DATABASE_ERROR_CODES.RECORD_NOT_FOUND]: {
    shouldAlert: false,
    shouldRetry: false,
    severity: SEVERITY.LOW,
    userMessage: 'The requested content was not found.',
  },
  [DATABASE_ERROR_CODES.DUPLICATE_ENTRY]: {
    shouldAlert: false,
    shouldRetry: false,
    severity: SEVERITY.LOW,
    userMessage: 'This content already exists.',
  },
  /**
   * Regular database error, should retry,
   * and we usually don't try catch this in code
   * Just bubble it naturally,
   * let it be handled by global error handler
   */
  [DATABASE_ERROR_CODES.TRANSACTION_FAILED]: {
    shouldAlert: false,
    shouldRetry: true,
    severity: SEVERITY.HIGH,
    userMessage: 'Operation failed. Please try again.',
  },
};

export { DATABASE_ERROR_CODES, DATABASE_ERRORS };
