import { SEVERITY } from './severity';
import type { ErrorMap } from './types';

const AUTH_ERROR_CODES = {
  UNAUTHORIZED: 'AUTH_2001',
  FORBIDDEN: 'AUTH_2002',
  TOKEN_EXPIRED: 'AUTH_2003',
  TOKEN_INVALID: 'AUTH_2004',
};

const AUTH_ERRORS: ErrorMap<typeof AUTH_ERROR_CODES> = {
  [AUTH_ERROR_CODES.UNAUTHORIZED]: {
    shouldAlert: false,
    shouldRetry: false,
    severity: SEVERITY.LOW,
    userMessage: 'Please sign in to continue.',
  },
  [AUTH_ERROR_CODES.FORBIDDEN]: {
    shouldAlert: false,
    shouldRetry: false,
    severity: SEVERITY.LOW,
    userMessage: "You don't have permission to perform this action.",
  },
  [AUTH_ERROR_CODES.TOKEN_EXPIRED]: {
    shouldAlert: false,
    shouldRetry: false,
    severity: SEVERITY.LOW,
    userMessage: 'Your session has expired. Please sign in again.',
  },
  [AUTH_ERROR_CODES.TOKEN_INVALID]: {
    shouldAlert: false,
    shouldRetry: false,
    severity: SEVERITY.LOW,
    userMessage: 'Authentication failed. Please sign in again.',
  },
};

export { AUTH_ERROR_CODES, AUTH_ERRORS };
