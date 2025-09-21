import { describe, expect, it, afterEach, vi } from 'vitest';
import { validateSignature } from './validator';

const mockWebhookSecret = 'test-secret';

vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    webhookSignature: 'test-secret',
  },
}));

describe('validateSignature', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when signature empty', () => {
    expect(validateSignature('')).toBe(false);
    expect(validateSignature(null)).toBe(false);
  });

  it('should return true when signature matches webhook secret', () => {
    expect(validateSignature(mockWebhookSecret)).toBe(true);
  });

  it('should return false when signature does not match webhook secret', () => {
    expect(validateSignature('wrong-secret')).toBe(false);
  });
});
