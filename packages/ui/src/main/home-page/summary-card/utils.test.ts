import { describe, it, expect } from 'vitest';
import { getCategoryIcon, getCategoryTitle } from './utils';

describe('Summary Card Utils', () => {
  describe('getCategoryIcon', () => {
    it('returns the correct icon for must category', () => {
      expect(getCategoryIcon('must')).toBe('🔴');
    });

    it('returns the correct icon for nice category', () => {
      expect(getCategoryIcon('nice')).toBe('🔵');
    });

    it('returns the correct icon for waste category', () => {
      expect(getCategoryIcon('waste')).toBe('🟠');
    });

    it('returns the correct icon for total category', () => {
      expect(getCategoryIcon('total')).toBe('💰');
    });

    it('returns the default icon for unknown category', () => {
      // @ts-expect-error Testing with invalid category
      expect(getCategoryIcon('unknown')).toBe('📊');
    });
  });

  describe('getCategoryTitle', () => {
    it('returns the correct title for must category', () => {
      expect(getCategoryTitle('must')).toBe('Must');
    });

    it('returns the correct title for nice category', () => {
      expect(getCategoryTitle('nice')).toBe('Nice');
    });

    it('returns the correct title for waste category', () => {
      expect(getCategoryTitle('waste')).toBe('Waste');
    });

    it('returns the correct title for total category', () => {
      expect(getCategoryTitle('total')).toBe('Total');
    });

    it('returns the default title for unknown category', () => {
      // @ts-expect-error Testing with invalid category
      expect(getCategoryTitle('unknown')).toBe('Expenses');
    });
  });
});