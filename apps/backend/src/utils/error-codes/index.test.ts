import { describe, expect, it } from 'vitest';
import { CRAWL_ERRORS, DATABASE_ERRORS, HTTP_ERRORS, VIDEO_ERRORS, type ErrorCode, type VideoErrorCode } from './index';

describe('error-codes', () => {
  it('should contain all expected http error codes', () => {
    const expectedCodes = ['NETWORK_ERROR', 'NETWORK_TIMEOUT', 'SERVER_ERROR', 'CLIENT_ERROR', 'EMPTY_RESPONSE'];

    const actualCodes = Object.values(HTTP_ERRORS);
    expect(actualCodes).toHaveLength(expectedCodes.length);
    expectedCodes.forEach(code => {
      expect(actualCodes).toContain(code);
    });
  });

  it('should contain all expected database codes', () => {
    const expectedCodes = ['DB_ERROR'];

    const actualCodes = Object.values(DATABASE_ERRORS);
    expect(actualCodes).toHaveLength(expectedCodes.length);
    expectedCodes.forEach(code => {
      expect(actualCodes).toContain(code);
    });
  });

  it('should contain all expected video error codes', () => {
    const expectedCodes = [
      'VIDEO_INVALID_FORMAT',
      'VIDEO_TOO_LARGE',
      'VIDEO_PROCESSING_FAILED',
      'VIDEO_TAKE_SCREENSHOT_FAILED',
      'VIDEO_NOT_FOUND',
      'VIDEO_CONVERSION_FAILED',
      'VIDEO_CONVERSION_TIMEOUT',
      'VIDEO_INVALID_RESOLUTION',
      'VIDEO_INVALID_LENGTH',
      'STORAGE_UPLOAD_FAILED',
      'STORAGE_DOWNLOAD_FAILED',
      'FIX_DURATION_ERROR',
      'FIX_THUMBNAIL_ERROR',
    ];

    const actualCodes = Object.values(VIDEO_ERRORS);
    expect(actualCodes).toHaveLength(expectedCodes.length);
    expectedCodes.forEach(code => {
      expect(actualCodes).toContain(code);
    });
  });

  it('should contain all expected crawl error codes', () => {
    const expectedCodes = ['UNSUPPORTED_SITE', 'MISSING_URL_SELECTOR', 'INVALID_JSON'];

    const actualCodes = Object.values(CRAWL_ERRORS);
    expect(actualCodes).toHaveLength(expectedCodes.length);
    expectedCodes.forEach(code => {
      expect(actualCodes).toContain(code);
    });
  });

  it('should have matching key-value pairs', () => {
    const prefixMap = {
      VIDEO: 'VIDEO_',
      CONVERSION: 'VIDEO_',
      STORAGE: 'STORAGE_',
    };

    Object.entries(VIDEO_ERRORS).forEach(([key, value]) => {
      const prefix = Object.keys(prefixMap).find(p => key.startsWith(p));
      if (prefix) {
        expect(value.startsWith(prefixMap[prefix])).toBeTruthy();
      }
    });
  });

  // Type checking tests (these will fail at compile time if types are wrong)
  it('should maintain type safety', () => {
    const testVideoErrorCode = (code: VideoErrorCode) => code;
    const testErrorCode = (code: ErrorCode) => code;

    // Valid assignments - should compile
    testVideoErrorCode(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    testErrorCode(VIDEO_ERRORS.STORAGE_UPLOAD_FAILED);

    // @ts-expect-error - Invalid error code
    testVideoErrorCode('INVALID_CODE');
    testErrorCode('RANDOM_ERROR');
  });
});
