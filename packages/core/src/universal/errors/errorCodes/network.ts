import { SEVERITY } from './severity';
import type { ErrorMap } from './types';

const NETWORK_ERROR_CODES = {
  CONNECTION_TIMEOUT: 'NET_7001',
  CONNECTION_FAILED: 'NET_7002',
} as const;

const NETWORK_ERRORS: ErrorMap<typeof NETWORK_ERROR_CODES> = {
  [NETWORK_ERROR_CODES.CONNECTION_TIMEOUT]: {
    shouldAlert: false,
    shouldRetry: true,
    severity: SEVERITY.LOW,
    userMessage: 'Connection timeout',
  },
  [NETWORK_ERROR_CODES.CONNECTION_FAILED]: {
    shouldAlert: false,
    shouldRetry: true,
    severity: SEVERITY.LOW,
    userMessage: 'Connection failed',
  },
};

export { NETWORK_ERROR_CODES, NETWORK_ERRORS };
