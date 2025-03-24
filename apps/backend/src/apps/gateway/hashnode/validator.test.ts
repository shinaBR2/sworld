import crypto from 'crypto';
import { describe, expect, test, vi } from 'vitest';
import { compareSignatures, createSignature, parseSignatureHeader, validateSignature } from './validator';

const MOCK_SECRET = 'whsec_1234567890';
// Use a fixed timestamp for tests
const NOW = 1742780691 * 1000;
vi.spyOn(Date, 'now').mockImplementation(() => NOW);

const VALID_TIMESTAMP = NOW;
const mockPayload = { event: 'test' };

// Generate valid signature for our test data
const VALID_SIGNATURE = createSignature({
  timestamp: VALID_TIMESTAMP,
  payload: mockPayload,
  secret: MOCK_SECRET,
});

const VALID_HEADER = `t=${VALID_TIMESTAMP},v1=${VALID_SIGNATURE}`;

// Generate expired signature
const EXPIRED_TIMESTAMP = VALID_TIMESTAMP - 31 * 1000;
const EXPIRED_SIGNATURE = createSignature({
  timestamp: EXPIRED_TIMESTAMP,
  payload: mockPayload,
  secret: MOCK_SECRET,
});
const EXPIRED_HEADER = `t=${EXPIRED_TIMESTAMP},v1=${EXPIRED_SIGNATURE}`;

describe('parseSignatureHeader', () => {
  test.each([
    [VALID_HEADER, true],
    ['invalidformat', false],
    ['t=123', false],
    ['v1=abc', false],
  ])('parses "%s" correctly', (input, expectedSuccess) => {
    const result = parseSignatureHeader(input);
    expect(result.success).toBe(expectedSuccess);
  });
});

describe('compareSignatures', () => {
  test('returns true for identical signatures', () => {
    const sig = crypto.randomBytes(32).toString('hex');
    expect(compareSignatures(sig, sig)).toBe(true);
  });

  test('returns false for different signatures', () => {
    const sig1 = crypto.randomBytes(32).toString('hex');
    const sig2 = crypto.randomBytes(32).toString('hex');
    expect(compareSignatures(sig1, sig2)).toBe(false);
  });

  test('handles different length signatures', () => {
    expect(compareSignatures('a', 'aa')).toBe(false);
  });

  test('handles crypto.timingSafeEqual error', () => {
    // Create buffers of different lengths which will cause timingSafeEqual to throw
    const result = compareSignatures('abc', 'abcd');
    expect(result).toBe(false);
  });
});

describe('validateSignature', () => {
  const validOptions = {
    incomingSignatureHeader: VALID_HEADER,
    payload: mockPayload,
    secret: MOCK_SECRET,
    validForSeconds: 30,
  };

  test('validates correct signature', () => {
    const result = validateSignature(validOptions);
    expect(result.isValid).toBe(true);
  });

  test('rejects invalid signature', () => {
    const result = validateSignature({
      ...validOptions,
      incomingSignatureHeader: `t=${VALID_TIMESTAMP},v1=${'0'.repeat(64)}`,
    });
    expect(result).toEqual({
      isValid: false,
      reason: 'Invalid signature',
    });
  });

  test('rejects missing header', () => {
    const result = validateSignature({
      ...validOptions,
      incomingSignatureHeader: null,
    });
    expect(result).toEqual({
      isValid: false,
      reason: 'Missing signature',
    });
  });

  test('rejects expired timestamp', () => {
    const result = validateSignature({
      ...validOptions,
      incomingSignatureHeader: EXPIRED_HEADER,
    });
    expect(result).toEqual({
      isValid: false,
      reason: 'Invalid timestamp',
    });
  });

  test('rejects malformed signature header', () => {
    const result = validateSignature({
      incomingSignatureHeader: 'malformed-header',
      payload: mockPayload,
      secret: MOCK_SECRET,
    });
    expect(result).toEqual({
      isValid: false,
      reason: 'Invalid signature header',
    });
  });
});
