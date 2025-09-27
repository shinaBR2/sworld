import type { SEVERITY_TYPE } from './types';

const SEVERITY: Record<Uppercase<SEVERITY_TYPE>, SEVERITY_TYPE> = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export { SEVERITY };
