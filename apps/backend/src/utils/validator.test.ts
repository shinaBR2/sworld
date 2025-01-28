import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validateRequest } from './validator';

describe('validateRequest', () => {
  // Mock Express request, response, and next function
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      params: {},
      query: {},
      body: {},
      headers: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  it('should call next() when validation passes', () => {
    // Create a simple schema
    const schema = z.object({
      body: z.object({
        name: z.string(),
        age: z.number(),
      }),
      params: z.object({}),
      query: z.object({}),
      headers: z.object({}),
    });

    // Set valid request data
    mockReq.body = {
      name: 'John',
      age: 25,
    };

    // Create middleware with schema
    const middleware = validateRequest(schema);

    // Execute middleware
    middleware(mockReq as Request, mockRes as Response, mockNext);

    // Verify next was called
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should set validatedData on request when validation passes', () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
      params: z.object({}),
      query: z.object({}),
      headers: z.object({}),
    });

    mockReq.body = {
      name: 'John',
    };

    const middleware = validateRequest(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq).toHaveProperty('validatedData');
    expect((mockReq as any).validatedData).toEqual({
      body: { name: 'John' },
      params: {},
      query: {},
      headers: {},
    });
  });

  it('should return error response when validation fails', () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
        age: z.number(),
      }),
      params: z.object({}),
      query: z.object({}),
      headers: z.object({}),
    });

    mockReq.body = {
      name: 123, // Invalid type for name
      age: 'invalid', // Invalid type for age
    };

    const middleware = validateRequest(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: expect.stringContaining('Invalid input:'),
      dataObject: null,
    });
  });

  it('should handle multiple validation errors', () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
        age: z.number().min(18),
      }),
      params: z.object({}),
      query: z.object({}),
      headers: z.object({}),
    });

    mockReq.body = {
      email: 'invalid-email',
      age: 15,
    };

    const middleware = validateRequest(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: expect.stringContaining('Invalid input:'),
      dataObject: null,
    });
    // Verify that the error message contains both validation errors
    const errorMessage = mockRes.json.mock.calls[0][0].message;
    expect(errorMessage).toMatch(/email/);
    expect(errorMessage).toMatch(/18/);
  });

  it('should validate query parameters', () => {
    const schema = z.object({
      body: z.object({}),
      params: z.object({}),
      query: z.object({
        page: z.string().regex(/^\d+$/),
        limit: z.string().regex(/^\d+$/),
      }),
      headers: z.object({}),
    });

    mockReq.query = {
      page: 'abc', // Invalid
      limit: '10', // Valid
    };

    const middleware = validateRequest(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: expect.stringContaining('Invalid input:'),
      dataObject: null,
    });
  });

  it('should validate request headers', () => {
    const schema = z.object({
      body: z.object({}),
      params: z.object({}),
      query: z.object({}),
      headers: z.object({
        'x-api-key': z.string().min(1),
      }),
    });

    mockReq.headers = {
      'x-api-key': '', // Invalid - empty string
    };

    const middleware = validateRequest(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: expect.stringContaining('Invalid input:'),
      dataObject: null,
    });
  });

  it('should validate URL parameters', () => {
    const schema = z.object({
      body: z.object({}),
      params: z.object({
        id: z.string().uuid(),
      }),
      query: z.object({}),
      headers: z.object({}),
    });

    mockReq.params = {
      id: 'invalid-uuid',
    };

    const middleware = validateRequest(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: expect.stringContaining('Invalid input:'),
      dataObject: null,
    });
  });
});
