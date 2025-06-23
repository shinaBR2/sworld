import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidEmail } from './email';

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
    expect(isValidEmail('123@domain.com')).toBe(true);
    expect(isValidEmail('very.common@example.com')).toBe(true);
    expect(isValidEmail('disposable.style.email.with+tag@example.com')).toBe(true);
    expect(isValidEmail('other.email-with-hyphen@example.com')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('user.domain.com')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
    expect(isValidEmail('user@com.')).toBe(false);
    expect(isValidEmail('user@.domain.com')).toBe(false);
  });

  it('should handle empty strings and whitespace', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
    expect(isValidEmail('\t\n')).toBe(false);
  });

  it('should enforce length limits', () => {
    // Local part > 64 chars
    expect(isValidEmail('a'.repeat(65) + '@example.com')).toBe(false);
    // Domain part > 255 chars
    expect(isValidEmail('user@' + 'a'.repeat(250) + '.com')).toBe(false);
    // Domain label > 63 chars
    expect(isValidEmail('user@' + 'a'.repeat(64) + '.com')).toBe(false);
  });

  it('should handle special characters in local part', () => {
    expect(isValidEmail('user.name+tag@example.com')).toBe(true);
    expect(isValidEmail('user-name@example.com')).toBe(true);
    expect(isValidEmail('user_name@example.com')).toBe(true);
    expect(isValidEmail("!#$%&'*+-/=?^_`{|}~@example.com")).toBe(true);
    expect(isValidEmail("user!#$%&'*+-/=?^_`{|}~tag@example.com")).toBe(true);
  });
});
