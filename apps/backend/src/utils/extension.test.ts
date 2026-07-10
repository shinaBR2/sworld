import { describe, it, expect } from 'vitest';
import { isValidExtensionId } from './extension';

describe('isValidExtensionId', () => {
  it('should accept a valid Chrome extension ID', () => {
    expect(isValidExtensionId('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab')).toBe(true);
    expect(isValidExtensionId('abcdefghijklmnopabcdefghijklmnop')).toBe(true);
    expect(isValidExtensionId('pppppppppppppppppppppppppppppppp')).toBe(true);
  });

  it('should reject an ID with invalid characters', () => {
    expect(isValidExtensionId('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaq')).toBe(false);
    expect(isValidExtensionId('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!')).toBe(false);
    expect(isValidExtensionId('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0')).toBe(false);
  });

  it('should reject an ID with incorrect length', () => {
    expect(isValidExtensionId('a'.repeat(31))).toBe(false);
    expect(isValidExtensionId('a'.repeat(33))).toBe(false);
    expect(isValidExtensionId('a'.repeat(10))).toBe(false);
  });

  it('should reject an empty string', () => {
    expect(isValidExtensionId('')).toBe(false);
  });

  it('should reject uppercase characters', () => {
    expect(isValidExtensionId('Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(false);
  });

  it('should reject null or undefined', () => {
    expect(isValidExtensionId(null as unknown as string)).toBe(false);
    expect(isValidExtensionId(undefined as unknown as string)).toBe(false);
  });
});
