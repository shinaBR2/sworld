import { CustomError } from 'src/utils/custom-error';
import { CRAWL_ERRORS } from 'src/utils/error-codes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHandlerType, getSelectors } from './utils';
import { validateUrlInput } from './validator';

vi.mock('./utils', () => ({
  getHandlerType: vi.fn(),
  getSelectors: vi.fn(),
}));

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    high: vi.fn(),
  },
}));

vi.mock('src/utils/systemConfig', () => ({
  crawlConfig: {
    defaultWaitForSelectorTimeout: 5000,
  },
}));

describe('validateUrlInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate URL and return handler type and selectors', () => {
    const url = 'https://example.com';
    const mockSelectors = [
      { selector: '.test', name: 'test' },
      { selector: '.test2', name: 'test2', waitForSelectorTimeout: 3000 },
    ];

    vi.mocked(getHandlerType).mockReturnValue('test-handler');
    vi.mocked(getSelectors).mockReturnValue(mockSelectors);

    const result = validateUrlInput(url);

    expect(getHandlerType).toHaveBeenCalledWith([url]);
    expect(getSelectors).toHaveBeenCalledWith('test-handler');
    expect(result).toEqual({
      handlerType: 'test-handler',
      selectors: [
        { selector: '.test', name: 'test', waitForSelectorTimeout: 5000 },
        { selector: '.test2', name: 'test2', waitForSelectorTimeout: 3000 },
      ],
    });
  });

  it('should throw error when handler type is invalid', () => {
    const url = 'https://invalid.com';
    vi.mocked(getHandlerType).mockReturnValue('');

    vi.mocked(CustomError.high).mockImplementation((message, metadata) => {
      throw new Error(`${message}: ${metadata.errorCode}`);
    });

    expect(() => validateUrlInput(url)).toThrow(
      'Invalid handler type: UNSUPPORTED_SITE',
    );
    expect(CustomError.high).toHaveBeenCalledWith('Invalid handler type', {
      shouldRetry: false,
      errorCode: CRAWL_ERRORS.UNSUPPORTED_SITE,
      context: { url },
      source: 'services/crawler/validator.ts',
    });
  });

  it('should throw error when selectors are empty', () => {
    const url = 'https://example.com';
    vi.mocked(getHandlerType).mockReturnValue('test-handler');
    vi.mocked(getSelectors).mockReturnValue([]);

    vi.mocked(CustomError.high).mockImplementation((message, metadata) => {
      throw new Error(`${message}: ${metadata.errorCode}`);
    });

    expect(() => validateUrlInput(url)).toThrow(
      'Missing selectors: UNSUPPORTED_SITE',
    );
    expect(CustomError.high).toHaveBeenCalledWith('Missing selectors', {
      shouldRetry: false,
      errorCode: CRAWL_ERRORS.UNSUPPORTED_SITE,
      context: { url },
      source: 'services/crawler/validator.ts',
    });
  });
});
