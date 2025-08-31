import type { Page } from 'playwright';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as hh3dModule from './hh3d';
import { selectors } from './hh3d/selectors';
import type { SelectorConfig } from './types';
import {
  createRequestHandler,
  getHandlerType,
  getSelectors,
  simpleScraper,
} from './utils';

// Mock the selectors import
vi.mock('./hh3d/selectors', () => ({
  selectors: ['mocked-selector-1', 'mocked-selector-2'],
}));

describe('Request Handler Utilities', () => {
  beforeEach(() => {
    vi.spyOn(hh3dModule, 'hh3dHandler').mockImplementation((_options) => {
      return {
        handler: () => {},
        initialState: {},
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getHandlerType', () => {
    it('should return "hh3d" for URLs containing hoathinh3d', () => {
      const urls = ['https://example.com/hoathinh3d/some-path'];
      expect(getHandlerType(urls)).toBe('hh3d');
    });

    it('should return empty string for unrecognized URLs', () => {
      const urls = ['https://example.com/other-site'];
      expect(getHandlerType(urls)).toBe('');
    });

    it('should return "hh3d" if any URL contains hoathinh3d', () => {
      const urls = [
        'https://example.com/other-site',
        'https://example.com/hoathinh3d/some-path',
      ];
      expect(getHandlerType(urls)).toBe('hh3d');
    });
  });

  describe('createRequestHandler', () => {
    const mockOptions = {
      startUrls: ['https://example.com/hoathinh3d'],
      maxConcurrency: 1,
    };

    it('should call hh3dHandler for "hh3d" handler type', () => {
      const mockHandlerResult = { handler: () => {}, initialState: {} };
      vi.spyOn(hh3dModule, 'hh3dHandler').mockReturnValue(mockHandlerResult);

      const result = createRequestHandler('hh3d', mockOptions);

      expect(hh3dModule.hh3dHandler).toHaveBeenCalledWith(mockOptions);
      expect(result).toBe(mockHandlerResult);
    });

    it('should throw error for unsupported handler type', () => {
      expect(() => createRequestHandler('unsupported', mockOptions)).toThrow(
        'Unsupported handler type: unsupported',
      );
    });
  });
});

describe('simpleScraper', () => {
  it('should return text content when element exists', async () => {
    const mockTextContent = 'Sample Text';
    const mockLocator = {
      textContent: vi.fn().mockResolvedValue(mockTextContent),
    };

    const mockPage = {
      locator: vi.fn().mockReturnValue(mockLocator),
    } as unknown as Page;

    const mockSelector: SelectorConfig = {
      name: 'test',
      selector: '.test-selector',
      waitForSelectorTimeout: 1000,
    };

    const result = await simpleScraper(mockPage, mockSelector);

    expect(mockPage.locator).toHaveBeenCalledWith('.test-selector');
    expect(mockLocator.textContent).toHaveBeenCalled();
    expect(result).toBe(mockTextContent);
  });

  it('should return empty string when text content is null', async () => {
    const mockLocator = {
      textContent: vi.fn().mockResolvedValue(null),
    };

    const mockPage = {
      locator: vi.fn().mockReturnValue(mockLocator),
    } as unknown as Page;

    const mockSelector: SelectorConfig = {
      name: 'test',
      selector: '.test-selector',
      waitForSelectorTimeout: 1000,
    };

    const result = await simpleScraper(mockPage, mockSelector);

    expect(mockPage.locator).toHaveBeenCalledWith('.test-selector');
    expect(mockLocator.textContent).toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('should return empty string when text content is undefined', async () => {
    const mockLocator = {
      textContent: vi.fn().mockResolvedValue(undefined),
    };

    const mockPage = {
      locator: vi.fn().mockReturnValue(mockLocator),
    } as unknown as Page;

    const mockSelector: SelectorConfig = {
      name: 'test',
      selector: '.test-selector',
      waitForSelectorTimeout: 1000,
    };

    const result = await simpleScraper(mockPage, mockSelector);

    expect(mockPage.locator).toHaveBeenCalledWith('.test-selector');
    expect(mockLocator.textContent).toHaveBeenCalled();
    expect(result).toBe('');
  });
});

describe('getSelectors', () => {
  it('should return hh3d selectors when handlerType is hh3d', () => {
    const result = getSelectors('hh3d');
    expect(result).toBe(selectors);
  });

  it('should throw error for unsupported handler type', () => {
    expect(() => getSelectors('unsupported')).toThrow(
      'Unsupported handler type: unsupported',
    );
    expect(() => getSelectors('')).toThrow('Unsupported handler type: ');
  });

  it('should throw error for undefined handler type', () => {
    // @ts-expect-error
    expect(() => getSelectors(undefined)).toThrow(
      'Unsupported handler type: undefined',
    );
  });

  it('should throw error for null handler type', () => {
    // @ts-expect-error
    expect(() => getSelectors(null)).toThrow('Unsupported handler type: null');
  });
});
