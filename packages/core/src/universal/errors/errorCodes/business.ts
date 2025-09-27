import { SEVERITY } from './severity';
import type { ErrorMap } from './types';

const BUSINESS_ERROR_CODES = {
  CONVERSION_FAILED: 'BIZ_6001',
} as const;

type BusinessErrorCode = keyof typeof BUSINESS_ERROR_CODES;

const BUSINESS_ERRORS: ErrorMap<typeof BUSINESS_ERROR_CODES> = {
  [BUSINESS_ERROR_CODES.CONVERSION_FAILED]: {
    shouldAlert: false,
    shouldRetry: true,
    severity: SEVERITY.LOW,
    userMessage: 'This video is not available.',
  },
};

export { BUSINESS_ERROR_CODES, BUSINESS_ERRORS, type BusinessErrorCode };
