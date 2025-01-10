import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { verifySignature } from './validator';

describe('verifySignature', () => {
  const mockWebhookSecret = 'test-secret';

  beforeEach(() => {
    process.env.NOCODB_WEBHOOK_SIGNATURE = mockWebhookSecret;
  });

  afterEach(() => {
    delete process.env.NOCODB_WEBHOOK_SIGNATURE;
  });

  it('should return true when signature matches webhook secret', () => {
    expect(verifySignature(mockWebhookSecret)).toBe(true);
  });

  it('should return false when signature does not match webhook secret', () => {
    expect(verifySignature('wrong-secret')).toBe(false);
  });
});
