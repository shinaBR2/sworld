import { describe, it, expect, vi } from 'vitest';
import { honoRequestHandler, type BusinessHandler } from './requestHandler';
import type { Context } from 'hono';

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

  describe('honoRequestHandler', () => {
    it('should handle successful requests', async () => {
      const mockContext = {
        get: vi.fn().mockReturnValue({ foo: 'bar' }),
        json: vi.fn(),
      } as unknown as Context;

      const handler = honoRequestHandler(mockSuccessHandler);
      await handler(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('validatedData');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        dataObject: { foo: 'bar' },
      });
    });

    it('should pass validated data to business handler', async () => {
      const validatedData = { test: 'data' };
      const mockContext = {
        get: vi.fn().mockReturnValue(validatedData),
        json: vi.fn(),
      } as unknown as Context;

      const handler = honoRequestHandler(mockSuccessHandler);
      await handler(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('validatedData');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        dataObject: validatedData,
      });
    });

    it('should let errors bubble up to middleware', async () => {
      const mockContext = {
        get: vi.fn().mockReturnValue({ foo: 'bar' }),
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
