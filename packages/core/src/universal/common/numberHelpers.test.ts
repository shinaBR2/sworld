import { describe, expect, it } from 'vitest';
import { formatNumber } from './numberHelpers';

describe('formatNumber', () => {
  it('should format integer numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(-10000)).toBe('-10,000');
  });

  it('should format floating point numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber(-9876.543)).toBe('-9,876.543');
  });

  it('should format large numbers', () => {
    expect(formatNumber(1000000000)).toBe('1,000,000,000');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(-1)).toBe('-1');
  });

  it('should format numbers with many decimals', () => {
    expect(formatNumber(1234.56789)).toBe('1,234.568');
  });
});
