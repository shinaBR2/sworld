import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { Context, Next } from 'hono';
import {
  validateData,
  honoValidateRequest,
  type ValidationContext,
} from './request';

describe('validateData', () => {
  const testSchema = z.object({
    body: z.object({
      name: z.string(),
      age: z.number(),
    }),
    query: z.object({
      filter: z.string().optional(),
    }),
    headers: z.object({
      'content-type': z.string(),
    }),
    params: z.object({
      id: z.string(),
    }),
    ip: z.string(),
    userAgent: z.string().optional(),
  });

  it('should validate valid data successfully', () => {
    const context: ValidationContext = {
      body: { name: 'John', age: 25 },
      query: { filter: 'active' },
      headers: { 'content-type': 'application/json' },
      params: { id: '123' },
      ip: '203.0.113.195',
      userAgent: 'TestAgent/1.0',
    };

    const result = validateData(testSchema, context);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(context);
  });

  it('should handle validation errors with proper formatting', () => {
    const context: ValidationContext = {
      body: { name: 'John', age: '25' }, // age should be number
      query: { filter: 123 }, // filter should be string
      headers: { 'content-type': '' }, // empty string
      params: {}, // missing id
      ip: '203.0.113.195',
      userAgent: 'TestAgent/1.0',
    };

    const result = validateData(testSchema, context);
    expect(result.success).toBe(false);
    expect(result.error).toContain('body age');
    expect(result.error).toContain('query filter');
    expect(result.error).toContain('params id');
  });
});

describe('honoValidateRequest', () => {
  const testSchema = z.object({
    body: z.object({
      name: z.string(),
    }),
    params: z.record(z.string()),
    query: z.record(z.any()),
    headers: z.record(z.string()),
  });

  it('should pass validation and call next for valid data', async () => {
    const mockContext = {
      req: {
        json: vi.fn().mockResolvedValue({ name: 'John' }),
        url: 'http://example.com?test=1',
        raw: {
          headers: new Headers({
            'x-forwarded-for': '203.0.113.195',
            'user-agent': 'TestAgent/1.0',
            'x-real-ip': '203.0.113.195',
          }),
        },
        param: vi.fn().mockReturnValue({}),
      },
      json: vi.fn(),
      set: vi.fn(),
    } as unknown as Context;

    const mockNext = vi.fn() as Next;
    const middleware = honoValidateRequest(testSchema);
    await middleware(mockContext, mockNext);

    expect(mockNext).toHaveBeenCalled();
    // The validated data should only include fields defined in the schema
    expect(mockContext.set).toHaveBeenCalledWith('validatedData', {
      body: { name: 'John' },
      params: {},
      query: { test: '1' },
      headers: expect.objectContaining({
        'x-forwarded-for': '203.0.113.195',
        'user-agent': 'TestAgent/1.0',
        'x-real-ip': '203.0.113.195',
      }),
    });
  });

  it('should return error response for invalid data', async () => {
    const mockContext = {
      req: {
        json: vi.fn().mockResolvedValue({ name: 123 }), // Invalid: name should be string
        url: 'http://example.com',
        raw: { headers: new Headers() },
        param: () => ({}),
      },
      json: vi.fn(),
    } as unknown as Context;

    const mockNext = vi.fn() as Next;
    const middleware = honoValidateRequest(testSchema);
    await middleware(mockContext, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith(
      {
        success: false,
        message: expect.stringContaining('Invalid input'),
        dataObject: null,
      },
      200,
    );
  });

  it('should handle JSON parsing errors by using empty object', async () => {
    const mockContext = {
      req: {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        url: 'http://example.com',
        raw: { headers: new Headers() },
        param: () => ({}),
      },
      json: vi.fn(),
    } as unknown as Context;

    const mockNext = vi.fn() as Next;
    const middleware = honoValidateRequest(testSchema);
    await middleware(mockContext, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith(
      {
        success: false,
        message: expect.stringContaining('Invalid input'),
        dataObject: null,
      },
      200,
    );
  });

  it('should handle other errors', async () => {
    const mockContext = {
      req: {
        json: vi.fn().mockResolvedValue({}),
        url: 'not-a-url', // This will cause URL parsing to fail
        raw: { headers: new Headers() },
        param: () => {
          throw new Error('Param error');
        },
      },
      json: vi.fn(),
    } as unknown as Context;

    const mockNext = vi.fn() as Next;
    const middleware = honoValidateRequest(testSchema);
    await middleware(mockContext, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith(
      {
        success: false,
        message: 'Failed to parse request',
        dataObject: null,
      },
      200,
    );
  });
});
