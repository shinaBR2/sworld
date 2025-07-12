import { describe, it, expect } from 'vitest';
import { getDisplayLanguage } from './utils';

describe('getDisplayLanguage', () => {
  it('should return the correct display name for known language codes', () => {
    const testCases = [
      { input: 'en', expected: 'English' },
      { input: 'vi', expected: 'Vietnamese' },
      { input: 'ja', expected: 'Japanese' },
      { input: 'ko', expected: 'Korean' },
      { input: 'zh', expected: 'Chinese' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(getDisplayLanguage(input)).toBe(expected);
    });
  });

  it('should return "Others" for unknown language codes', () => {
    const unknownCodes = ['fr', 'es', 'de', ''];

    unknownCodes.forEach(code => {
      expect(getDisplayLanguage(code)).toBe('Others');
    });
  });

  it('should handle case sensitivity', () => {
    expect(getDisplayLanguage('EN')).toBe('Others');
    expect(getDisplayLanguage('Vi')).toBe('Others');
  });

  it('should handle empty string input', () => {
    expect(getDisplayLanguage('')).toBe('Others');
  });
});
