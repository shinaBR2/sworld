import { SEVERITY } from './severity';

const VALIDATION_ERROR_CODES = {
  INVALID_INPUT: 'VAL_8001',
} as const;

const VALIDATION_ERRORS = {
  [VALIDATION_ERROR_CODES.INVALID_INPUT]: {
    shouldAlert: false,
    shouldRetry: false,
    severity: SEVERITY.LOW,
    userMessage: 'Invalid input. Please check your data and try again.',
  },
};

export { VALIDATION_ERROR_CODES, VALIDATION_ERRORS };
