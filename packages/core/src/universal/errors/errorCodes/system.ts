import { SEVERITY } from './severity';
import type { ErrorMap } from './types';

const SYSTEM_ERROR_CODES = {
  UNEXPECTED_ERROR: 'SYS_1001',
  // SERVICE_UNAVAILABLE: 'SYS_1002',
  TIMEOUT: 'SYS_1003',
  CONFIGURATION_ERROR: 'SYS_1004',
  MEMORY_LIMIT_EXCEEDED: 'SYS_1005',
} as const;

const SYSTEM_ERRORS: ErrorMap<typeof SYSTEM_ERROR_CODES> = {
  [SYSTEM_ERROR_CODES.UNEXPECTED_ERROR]: {
    shouldAlert: true,
    shouldRetry: false,
    severity: SEVERITY.CRITICAL,
    userMessage: 'An unexpected error occurred. We are working on it!',
  },
  [SYSTEM_ERROR_CODES.TIMEOUT]: {
    shouldAlert: true,
    shouldRetry: true,
    severity: SEVERITY.HIGH,
    userMessage: 'Request timed out. Please try again later.',
  },
  [SYSTEM_ERROR_CODES.CONFIGURATION_ERROR]: {
    shouldAlert: true,
    shouldRetry: false,
    severity: SEVERITY.HIGH,
    userMessage: 'Configuration error occurred. We are working on it!',
  },
  [SYSTEM_ERROR_CODES.MEMORY_LIMIT_EXCEEDED]: {
    shouldAlert: true,
    shouldRetry: false,
    severity: SEVERITY.HIGH,
    userMessage: 'Memory limit exceeded. We are working on it!',
  },
};

export { SYSTEM_ERROR_CODES, SYSTEM_ERRORS };
