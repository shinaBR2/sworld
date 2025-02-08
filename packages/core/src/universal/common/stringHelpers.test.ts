import { describe, it, expect } from 'vitest';
import { compareString, slugify } from './stringHelpers';

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
    expect(compareString(null as unknown as string, null as unknown as string)).toBe(false);
    expect(compareString(undefined as unknown as string, undefined as unknown as string)).toBe(false);
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
    expect(slugify('một khúc hồng trần quyết')).toBe('mot-khuc-hong-tran-quyet');
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
