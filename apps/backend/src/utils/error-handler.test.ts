import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import * as Sentry from '@sentry/node';
import { errorHandler } from './error-handler';
import { CustomError } from './custom-error';

vi.mock('@sentry/node', () => ({
  withScope: vi.fn(callback =>
    callback({
      setLevel: vi.fn(),
      setTag: vi.fn(),
      setTags: vi.fn(),
      setExtra: vi.fn(),
    })
  ),
  captureException: vi.fn(),
}));

describe('errorHandler', () => {
  const mockLogger = {
    error: vi.fn(),
  } as unknown as Logger;

  const mockRequest = {
    method: 'POST',
    url: '/webhook',
    headers: {
      'ce-type': 'hasura:event',
    },
  } as unknown as Request;

  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  it('should handle CustomError correctly', () => {
    const customError = new CustomError('Custom test error', {
      errorCode: 'TEST_ERROR',
      severity: 'critical',
      context: {
        data: { test: 'data' },
        source: 'test-source',
      },
      originalError: new Error('Original error'),
    });

    const handler = errorHandler(mockLogger);
    handler(customError, mockRequest, mockResponse, vi.fn());

    // Check Sentry tags and extras were set
    const mockSetTags = vi.fn();
    const mockSetExtra = vi.fn();

    vi.mocked(Sentry.withScope).mock.calls[0][0]({
      setTags: mockSetTags,
      setExtra: mockSetExtra,
      setLevel: vi.fn(),
      setContext: vi.fn(),
      setUser: vi.fn(),
      setTag: vi.fn(),
      setFingerprint: vi.fn(),
      addBreadcrumb: vi.fn(),
      setTransactionName: vi.fn(),
      setSpan: vi.fn(),
      clear: vi.fn(),
    });

    // Check tags were set correctly
    expect(mockSetTags).toHaveBeenCalledWith({
      errorCode: 'TEST_ERROR',
      severity: 'critical',
    });

    // Check extras were set correctly
    // First extra should be the context
    expect(mockSetExtra).toHaveBeenCalledWith('Unknown', {
      data: { test: 'data' },
      source: 'test-source',
    });

    // Second extra should be the original error
    expect(mockSetExtra).toHaveBeenCalledWith('originalError', {
      message: 'Original error',
      name: 'Error',
      stack: expect.any(String),
    });

    // Check Sentry exception was captured
    expect(Sentry.captureException).toHaveBeenCalledWith(customError);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    // Check response
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Custom test error',
    });
  });

  it('should handle standard errors correctly', () => {
    const error = new Error('Test error');
    const handler = errorHandler(mockLogger);

    handler(error, mockRequest, mockResponse, vi.fn());

    // Check Sentry calls
    expect(Sentry.withScope).toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);

    // Check logger calls
    expect(mockLogger.error).toHaveBeenCalledWith({
      req: {
        method: 'POST',
        url: '/webhook',
        eventType: 'hasura:event',
      },
      stack: expect.stringContaining('Test error'),
    });

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    // Check response
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Test error',
    });
  });

  it('should handle errors in production mode', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Test error');
    const handler = errorHandler(mockLogger);

    handler(error, mockRequest, mockResponse, vi.fn());

    expect(mockLogger.error).toHaveBeenCalledWith({
      req: {
        method: 'POST',
        url: '/webhook',
        eventType: 'hasura:event',
      },
      stack: undefined,
    });

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });

  it('should clean stack traces from node_modules', () => {
    const error = new Error('Test error');
    error.stack = `Error: Test error
    at Object.<anonymous> (/app/src/test.ts:1:1)
    at Module._compile (node_modules/module/wrap.js:10:10)
    at Object.Module._extensions..js (node_modules/module/load.js:20:20)
    at customFunction (/app/src/utils/helper.ts:5:5)`;

    const handler = errorHandler(mockLogger);
    handler(error, mockRequest, mockResponse, vi.fn());

    expect(mockLogger.error).toHaveBeenCalledWith({
      req: expect.any(Object),
      stack: expect.stringContaining('/app/src/test.ts:1:1'),
    });

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.not.stringContaining('node_modules'),
      })
    );
  });

  it('should handle missing ce-type header', () => {
    const error = new Error('Test error');
    const reqWithoutEventType = {
      ...mockRequest,
      headers: {},
    };

    const handler = errorHandler(mockLogger);
    handler(error, reqWithoutEventType, mockResponse, vi.fn());

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        req: expect.objectContaining({
          eventType: undefined,
        }),
      })
    );
  });
});
