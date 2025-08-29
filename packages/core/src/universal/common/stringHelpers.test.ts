import { describe, expect, it } from 'vitest';
import {
  compareString,
  isValidEmail,
  isValidId,
  slugify,
} from './stringHelpers';

describe('compareString', () => {
  it('should return true for identical strings', () => {
    expect(compareString('hello', 'hello')).toBe(true);
    expect(compareString('test123', 'test123')).toBe(true);
  });

  it('should ignore case when comparing strings', () => {
    expect(compareString('Hello', 'hello')).toBe(true);
    expect(compareString('WORLD', 'world')).toBe(true);
    expect(compareString('TeSt', 'tEsT')).toBe(true);
  });

  it('should handle empty strings', () => {
    expect(compareString('', '')).toBe(false);
    expect(compareString('test', '')).toBe(false);
    expect(compareString('', 'test')).toBe(false);
  });

  it('should handle null and undefined values', () => {
    expect(compareString(null as unknown as string, 'test')).toBe(false);
    expect(compareString('test', null as unknown as string)).toBe(false);
    expect(compareString(undefined as unknown as string, 'test')).toBe(false);
    expect(compareString('test', undefined as unknown as string)).toBe(false);
    expect(
      compareString(null as unknown as string, null as unknown as string),
    ).toBe(false);
    expect(
      compareString(
        undefined as unknown as string,
        undefined as unknown as string,
      ),
    ).toBe(false);
  });

  it('should handle strings with special characters', () => {
    expect(compareString('hello!', 'HELLO!')).toBe(true);
    expect(compareString('test@123', 'TEST@123')).toBe(true);
  });

  it('should return false for different strings', () => {
    expect(compareString('hello', 'world')).toBe(false);
    expect(compareString('test123', 'test456')).toBe(false);
    expect(compareString('hello world', 'helloworld')).toBe(false);
  });
});

describe('slugify', () => {
  it('should convert basic strings to slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('My Blog Post Title')).toBe('my-blog-post-title');
  });

  it('should handle special characters', () => {
    expect(slugify('Hello@World!')).toBe('helloworld');
    expect(slugify('Special $#@ Characters')).toBe('special-characters');
  });

  it('should handle accents and diacritics', () => {
    expect(slugify('café')).toBe('cafe');
    expect(slugify('piñata')).toBe('pinata');
    expect(slugify('résumé')).toBe('resume');
  });

  it('should handle multiple separators', () => {
    expect(slugify('hello   world')).toBe('hello-world');
    expect(slugify('hello___world')).toBe('hello-world');
    expect(slugify('hello---world')).toBe('hello-world');
    expect(slugify('hello - - - world')).toBe('hello-world');
  });

  it('should handle empty strings', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });

  it('should handle strings with only special characters', () => {
    expect(slugify('@#$%')).toBe('');
    expect(slugify('!!!---@@@')).toBe('');
  });

  it('should handle mixed alphanumeric and special characters', () => {
    expect(slugify('hello123!@#world')).toBe('hello123world');
    expect(slugify('test-123-!@#')).toBe('test-123');
  });

  it('should handle Vietnamese characters', () => {
    expect(slugify('một khúc hồng trần quyết')).toBe(
      'mot-khuc-hong-tran-quyet',
    );
    expect(slugify('Đà Nẵng')).toBe('da-nang');
    expect(slugify('Hà Nội')).toBe('ha-noi');
    expect(slugify('Hồ Chí Minh')).toBe('ho-chi-minh');
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(1000);
    expect(slugify(longString)).toBe('a'.repeat(1000));
  });

  it('should handle strings with maximum URL length', () => {
    const longString = 'a'.repeat(2048);
    const result = slugify(longString);
    expect(result.length).toBeLessThanOrEqual(2048);
  });
});

describe('isValidId', () => {
  it('should return true for valid UUIDs', () => {
    expect(isValidId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isValidId('987fcdeb-51a2-4321-9b78-123456789012')).toBe(true);
  });

  it('should return false for invalid UUIDs', () => {
    expect(isValidId('not-a-uuid')).toBe(false);
    expect(isValidId('123e4567-e89b-12g3-a456-426614174000')).toBe(false); // invalid character 'g'
    expect(isValidId('123e4567-e89b-62d3-a456-426614174000')).toBe(false); // invalid version
    expect(isValidId('123e4567-e89b-12d3-c456-426614174000')).toBe(false); // invalid variant
  });

  it('should handle empty strings and whitespace', () => {
    expect(isValidId('')).toBe(false);
    expect(isValidId('   ')).toBe(false);
    expect(isValidId('\t\n')).toBe(false);
  });

  it('should handle non-string inputs', () => {
    expect(isValidId(null as unknown as string)).toBe(false);
    expect(isValidId(undefined as unknown as string)).toBe(false);
    expect(isValidId(123 as unknown as string)).toBe(false);
    expect(isValidId({} as unknown as string)).toBe(false);
  });

  it('should handle strings with whitespace', () => {
    expect(isValidId('  123e4567-e89b-12d3-a456-426614174000  ')).toBe(true);
    expect(isValidId('\n123e4567-e89b-12d3-a456-426614174000\t')).toBe(true);
  });
});

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
    expect(isValidEmail('123@domain.com')).toBe(true);
    expect(isValidEmail('very.common@example.com')).toBe(true);
    expect(isValidEmail('disposable.style.email.with+tag@example.com')).toBe(
      true,
    );
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
