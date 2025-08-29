import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatDate,
  formatDateTime,
  getCurrentMonthYear,
  getMonthName,
  getStartEndDates,
} from './dateHelpers';

describe('Date Helpers', () => {
  const mockDate = new Date('2023-05-15T10:30:00');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const result = formatDate('2023-05-15');
      expect(result).toBe('Mon, May 15');
    });

    it('handles different dates', () => {
      expect(formatDate('2023-12-25')).toBe('Mon, Dec 25');
      expect(formatDate('2024-01-01')).toBe('Mon, Jan 1');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const result = formatDateTime('2023-05-15T14:30:00');
      expect(result).toBe('May 15, 2023, 2:30 PM');
    });

    it('handles different times', () => {
      expect(formatDateTime('2023-05-15T09:00:00')).toBe(
        'May 15, 2023, 9:00 AM',
      );
      expect(formatDateTime('2023-05-15T23:59:00')).toBe(
        'May 15, 2023, 11:59 PM',
      );
    });
  });

  describe('getMonthName', () => {
    it('returns correct month names', () => {
      expect(getMonthName(1)).toBe('January');
      expect(getMonthName(6)).toBe('June');
      expect(getMonthName(12)).toBe('December');
    });

    it('handles month numbers at boundaries', () => {
      expect(getMonthName(1)).toBe('January');
      expect(getMonthName(12)).toBe('December');
    });
  });

  describe('getCurrentMonthYear', () => {
    it('returns current month and year', () => {
      const result = getCurrentMonthYear();
      expect(result).toEqual({ month: 5, year: 2023 });
    });
  });

  describe('getStartEndDates', () => {
    it('returns correct start and end dates for a month', () => {
      const result = getStartEndDates(5, 2023);
      expect(result).toEqual({
        startDate: '2023-05-01',
        endDate: '2023-05-31',
      });
    });

    it('handles months with different lengths', () => {
      // February in non-leap year
      expect(getStartEndDates(2, 2023)).toEqual({
        startDate: '2023-02-01',
        endDate: '2023-02-28',
      });

      // February in leap year
      expect(getStartEndDates(2, 2024)).toEqual({
        startDate: '2024-02-01',
        endDate: '2024-02-29',
      });

      // Month with 30 days
      expect(getStartEndDates(4, 2023)).toEqual({
        startDate: '2023-04-01',
        endDate: '2023-04-30',
      });
    });

    it('handles year transitions', () => {
      const result = getStartEndDates(12, 2023);
      expect(result).toEqual({
        startDate: '2023-12-01',
        endDate: '2023-12-31',
      });
    });
  });
});
