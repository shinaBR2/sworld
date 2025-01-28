import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import { errorHandler } from './error-handler';

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
  };

  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log error with stack trace in development', () => {
    const error = new Error('Test error');
    process.env.NODE_ENV = 'development';

    const handler = errorHandler(mockLogger);
    handler(error, mockRequest, mockResponse, vi.fn());

    expect(mockLogger.error).toHaveBeenCalledWith({
      err: error,
      req: {
        method: 'POST',
        url: '/webhook',
        eventType: 'hasura:event',
      },
      stack: error.stack,
    });

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Test error',
    });
  });

  it('should log error without stack trace in production', () => {
    const error = new Error('Test error');
    process.env.NODE_ENV = 'production';

    const handler = errorHandler(mockLogger);
    handler(error, mockRequest, mockResponse, vi.fn());

    expect(mockLogger.error).toHaveBeenCalledWith({
      err: error,
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

  it('should handle missing ce-type header', () => {
    const error = new Error('Test error');
    const reqWithoutEventType = {
      ...mockRequest,
      headers: {},
    } as Request;

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
