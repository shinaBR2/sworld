import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomBytes } from 'crypto';
import { generateSecureCode, generateHumanCode } from './string';

// Mock crypto module
vi.mock('crypto', () => ({
  randomBytes: vi.fn(),
}));

const mockedRandomBytes = vi.mocked(randomBytes);

describe('generateSecureCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a base64url string', () => {
    const mockBuffer = Buffer.from([1, 2, 3, 4]);
    mockedRandomBytes.mockReturnValue(mockBuffer);

    const result = generateSecureCode(4);

    expect(mockedRandomBytes).toHaveBeenCalledWith(4);
    expect(result).toBe(mockBuffer.toString('base64url'));
    expect(typeof result).toBe('string');
  });

  it('should call randomBytes with correct length', () => {
    const mockBuffer = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
    mockedRandomBytes.mockReturnValue(mockBuffer);

    generateSecureCode(8);

    expect(mockedRandomBytes).toHaveBeenCalledWith(8);
  });

  it('should handle different lengths', () => {
    const lengths = [4, 8, 16, 32];

    lengths.forEach(length => {
      const mockBuffer = Buffer.alloc(length, 1);
      mockedRandomBytes.mockReturnValue(mockBuffer);

      const result = generateSecureCode(length);

      expect(mockedRandomBytes).toHaveBeenCalledWith(length);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  it('should generate different codes for same length', () => {
    const mockBuffer1 = Buffer.from([1, 2, 3, 4]);
    const mockBuffer2 = Buffer.from([5, 6, 7, 8]);

    mockedRandomBytes.mockReturnValueOnce(mockBuffer1).mockReturnValueOnce(mockBuffer2);

    const result1 = generateSecureCode(4);
    const result2 = generateSecureCode(4);

    expect(result1).not.toBe(result2);
  });
});

describe('generateHumanCode', () => {
  const validWords = ['BIRD', 'TREE', 'BLUE', 'MOON', 'STAR', 'WIND'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate code with correct format', () => {
    // Mock for word selection (1 byte)
    const mockBuffer1 = Buffer.from([0]); // First word (BIRD)
    // Mock for number generation (2 bytes)
    const mockBuffer2 = Buffer.from([0, 0]); // Should generate 000

    mockedRandomBytes
      .mockReturnValueOnce(mockBuffer2) // First call for numbers
      .mockReturnValueOnce(mockBuffer1); // Second call for word

    const result = generateHumanCode();

    expect(result).toMatch(/^[A-Z]+-\d{3}$/);
    expect(result).toBe('BIRD-000');
  });

  it('should use valid words from the word list', () => {
    // Test multiple generations to ensure all words are valid
    const results: string[] = [];

    for (let i = 0; i < 20; i++) {
      // Mock different values for variety
      const wordIndex = i % validWords.length;
      const wordBuffer = Buffer.from([Math.floor((wordIndex / validWords.length) * 255)]);
      const numberBuffer = Buffer.from([i, i + 1]);

      mockedRandomBytes.mockReturnValueOnce(numberBuffer).mockReturnValueOnce(wordBuffer);

      results.push(generateHumanCode());
    }

    results.forEach(result => {
      const [word] = result.split('-');
      expect(validWords).toContain(word);
    });
  });

  it('should generate numbers with exactly 3 digits', () => {
    // Test edge cases for number generation
    const testCases = [
      { bytes: [0, 0], expectedNumber: '000' },
      { bytes: [255, 255], expectedNumber: '999' }, // Max value should be 999
      { bytes: [127, 255], expectedNumber: '499' }, // Roughly middle value
    ];

    testCases.forEach(({ bytes, expectedNumber }) => {
      const wordBuffer = Buffer.from([0]); // BIRD
      const numberBuffer = Buffer.from(bytes);

      mockedRandomBytes.mockReturnValueOnce(numberBuffer).mockReturnValueOnce(wordBuffer);

      const result = generateHumanCode();
      const [, number] = result.split('-');

      expect(number).toBe(expectedNumber);
      expect(number).toHaveLength(3);
    });
  });

  it('should call randomBytes twice with correct parameters', () => {
    const wordBuffer = Buffer.from([0]);
    const numberBuffer = Buffer.from([0, 0]);

    mockedRandomBytes.mockReturnValueOnce(numberBuffer).mockReturnValueOnce(wordBuffer);

    generateHumanCode();

    expect(mockedRandomBytes).toHaveBeenCalledTimes(2);
    expect(mockedRandomBytes).toHaveBeenNthCalledWith(1, 2); // For numbers
    expect(mockedRandomBytes).toHaveBeenNthCalledWith(2, 1); // For word selection
  });

  it('should generate different codes on multiple calls', () => {
    const results = new Set<string>();

    // Generate multiple codes with different mock values
    for (let i = 0; i < 10; i++) {
      const wordBuffer = Buffer.from([i * 25]);
      const numberBuffer = Buffer.from([i * 10, i * 20]);

      mockedRandomBytes.mockReturnValueOnce(numberBuffer).mockReturnValueOnce(wordBuffer);

      results.add(generateHumanCode());
    }

    // Should generate different codes (high probability with different inputs)
    expect(results.size).toBeGreaterThan(1);
  });

  it('should handle word selection edge cases', () => {
    // Test first and last word selection
    const testCases = [
      { byteValue: 0, expectedWord: 'BIRD' }, // Should select first word
      { byteValue: 254, expectedWord: 'WIND' }, // Should select last word (254/255 * 6 = 5.98 -> floor = 5)
    ];

    testCases.forEach(({ byteValue, expectedWord }) => {
      const wordBuffer = Buffer.from([byteValue]);
      const numberBuffer = Buffer.from([0, 0]);

      mockedRandomBytes.mockReturnValueOnce(numberBuffer).mockReturnValueOnce(wordBuffer);

      const result = generateHumanCode();
      const [word] = result.split('-');

      expect(word).toBe(expectedWord);
    });
  });

  it('should always return string in WORD-NNN format', () => {
    // Test with random mock values
    for (let i = 0; i < 50; i++) {
      const wordBuffer = Buffer.from([Math.floor(Math.random() * 255)]);
      const numberBuffer = Buffer.from([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);

      mockedRandomBytes.mockReturnValueOnce(numberBuffer).mockReturnValueOnce(wordBuffer);

      const result = generateHumanCode();

      // Check format
      expect(result).toMatch(/^[A-Z]+-\d{3}$/);

      // Check parts
      const [word, number] = result.split('-');
      expect(validWords).toContain(word);
      expect(number).toHaveLength(3);
      expect(parseInt(number, 10)).toBeGreaterThanOrEqual(0);
      expect(parseInt(number, 10)).toBeLessThanOrEqual(999);
    }
  });
});
