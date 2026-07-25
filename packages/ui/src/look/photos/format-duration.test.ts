import { describe, expect, it } from 'vitest';
import { formatDuration } from './format-duration';

describe('formatDuration', () => {
  it('returns an empty string for missing, non-positive, or non-finite values', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(-5)).toBe('');
    expect(formatDuration(Number.NaN)).toBe('');
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('');
  });

  it('formats sub-hour durations as m:ss with a zero-padded seconds field', () => {
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(9)).toBe('0:09');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(600)).toBe('10:00');
  });

  it('formats hour-plus durations as h:mm:ss with zero-padded minutes and seconds', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7325)).toBe('2:02:05');
  });

  it('floors fractional seconds', () => {
    expect(formatDuration(65.9)).toBe('1:05');
  });
});
