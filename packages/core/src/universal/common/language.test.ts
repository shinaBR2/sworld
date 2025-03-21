import { describe, expect, it } from 'vitest';
import { getLanguageName } from './language';

describe('getLanguageName', () => {
  it('should return correct names for supported languages', () => {
    const testCases = [
      { code: 'vi', expected: 'Vietnamese' },
      { code: 'en', expected: 'English' },
      { code: 'ja', expected: 'Japanese' },
      { code: 'zh', expected: 'Chinese' },
    ];

    testCases.forEach(({ code, expected }) => {
      expect(getLanguageName(code)).toBe(expected);
    });
  });

  it('should return code itself for unsupported languages', () => {
    expect(getLanguageName('es')).toBe('es');
    expect(getLanguageName('fr')).toBe('fr');
    expect(getLanguageName('')).toBe('');
  });
});
