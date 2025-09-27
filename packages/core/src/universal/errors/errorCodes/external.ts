import { SEVERITY } from './severity';
import type { ErrorMap } from './types';

const EXTERNAL_ERROR_CODES = {
  GCP_STORAGE_ERROR: 'EXT_4001',
  CLOUDINARY_ERROR: 'EXT_4002',
  AUTH0_ERROR: 'EXT_4003',
  RATE_LIMIT_EXCEEDED: 'EXT_4004',
} as const;

const EXTERNAL_ERRORS: ErrorMap<typeof EXTERNAL_ERROR_CODES> = {
  [EXTERNAL_ERROR_CODES.GCP_STORAGE_ERROR]: {
    shouldAlert: false,
    shouldRetry: true,
    severity: SEVERITY.HIGH,
    userMessage: 'File operation failed. Please try again.',
  },
  [EXTERNAL_ERROR_CODES.CLOUDINARY_ERROR]: {
    shouldAlert: false,
    shouldRetry: true,
    severity: SEVERITY.MEDIUM,
    userMessage: 'Image processing failed. We are working on it!',
  },
  [EXTERNAL_ERROR_CODES.AUTH0_ERROR]: {
    shouldAlert: false,
    shouldRetry: true,
    severity: SEVERITY.HIGH,
    userMessage: 'Authentication service unavailable. Please try again.',
  },
  [EXTERNAL_ERROR_CODES.RATE_LIMIT_EXCEEDED]: {
    shouldAlert: false,
    shouldRetry: true,
    severity: SEVERITY.MEDIUM,
    userMessage: 'Too many requests. Please wait a moment and try again.',
  },
};

export { EXTERNAL_ERROR_CODES, EXTERNAL_ERRORS };
