import { describe, it, expect, vi } from 'vitest';
import {
  expressRequestHandler,
  honoRequestHandler,
  type BusinessHandler,
} from './requestHandler';
import type { Request, Response } from 'express';
import type { Context } from 'hono';
import { ServiceResponse } from './schema';

describe('requestHandler', () => {
  // Mock business handler that returns successful response
  const mockSuccessHandler: BusinessHandler = async (context) => {
    return {
      success: true,
      message: 'Success',
      dataObject: context.validatedData,
    };
  };

  // Mock business handler that throws an error
  const mockErrorHandler: BusinessHandler = async () => {
    throw new Error('Business logic error');
  };

  describe('expressRequestHandler', () => {
    it('should handle successful requests', async () => {
      const mockReq = {
        validatedData: { foo: 'bar' },
      } as unknown as Request;

      const mockRes = {
        json: vi.fn(),
      } as unknown as Response;

      const handler = expressRequestHandler(mockSuccessHandler);
      await handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        dataObject: { foo: 'bar' },
      });
    });

    it('should pass validated data to business handler', async () => {
      const validatedData = { test: 'data' };
      const mockReq = {
        validatedData,
      } as unknown as Request;

      const mockRes = {
        json: vi.fn(),
      } as unknown as Response;

      const handler = expressRequestHandler(mockSuccessHandler);
      await handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        dataObject: validatedData,
      });
    });
  });

  describe('error handling', () => {
    it('should let errors bubble up to middleware', async () => {
      const mockReq = { validatedData: { foo: 'bar' } } as unknown as Request;
      const mockRes = { json: vi.fn() } as unknown as Response;

      const handler = expressRequestHandler(mockErrorHandler);
      await expect(handler(mockReq, mockRes)).rejects.toThrow(
        'Business logic error',
      );
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('honoRequestHandler', () => {
    it('should handle successful requests', async () => {
      const mockContext = {
        validatedData: { foo: 'bar' },
        json: vi.fn(),
      } as unknown as Context;

      const handler = honoRequestHandler(mockSuccessHandler);
      await handler(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        dataObject: { foo: 'bar' },
      });
    });

    it('should pass validated data to business handler', async () => {
      const validatedData = { test: 'data' };
      const mockContext = {
        validatedData,
        json: vi.fn(),
      } as unknown as Context;

      const handler = honoRequestHandler(mockSuccessHandler);
      await handler(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        dataObject: validatedData,
      });
    });

    it('should let errors bubble up to middleware', async () => {
      const mockContext = {
        validatedData: { foo: 'bar' },
        json: vi.fn(),
      } as unknown as Context;

      const handler = honoRequestHandler(mockErrorHandler);
      await expect(handler(mockContext)).rejects.toThrow(
        'Business logic error',
      );
      expect(mockContext.json).not.toHaveBeenCalled();
    });
  });
});
