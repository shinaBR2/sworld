// test/validateHeaders.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { validateHeaders } from './index';

describe('validateHeaders', () => {
  const mockContext = {
    req: {
      raw: {
        headers: new Headers(),
      },
    },
    json: vi.fn(),
  };

  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.json.mockReturnValue({ success: false });
  });

  it('should call next() when headers are valid', async () => {
    const headerSchema = z.object({
      'content-type': z.string(),
      authorization: z.string(),
    });

    mockContext.req.raw.headers = new Headers({
      'content-type': 'application/json',
      authorization: 'Bearer token123',
    });

    const middleware = validateHeaders(headerSchema);
    await middleware(mockContext as any, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
    expect(mockContext.json).not.toHaveBeenCalled();
  });

  it('should return error response when headers are invalid', async () => {
    const headerSchema = z.object({
      'content-type': z.string(),
      authorization: z.string(),
    });

    mockContext.req.raw.headers = new Headers({
      'content-type': 'application/json',
      // missing authorization header
    });

    const middleware = validateHeaders(headerSchema);
    await middleware(mockContext as any, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid headers',
      errors: expect.any(Object),
    });
  });

  it('should handle empty headers', async () => {
    const headerSchema = z.object({
      'x-api-key': z.string(),
    });

    mockContext.req.raw.headers = new Headers();

    const middleware = validateHeaders(headerSchema);
    await middleware(mockContext as any, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid headers',
      errors: expect.any(Object),
    });
  });

  it('should validate with optional headers', async () => {
    const headerSchema = z.object({
      'content-type': z.string(),
      'x-optional': z.string().optional(),
    });

    mockContext.req.raw.headers = new Headers({
      'content-type': 'application/json',
    });

    const middleware = validateHeaders(headerSchema);
    await middleware(mockContext as any, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
    expect(mockContext.json).not.toHaveBeenCalled();
  });

  it('should handle case-sensitive header names', async () => {
    const headerSchema = z.object({
      'Content-Type': z.string(),
    });

    mockContext.req.raw.headers = new Headers({
      'content-type': 'application/json', // lowercase
    });

    const middleware = validateHeaders(headerSchema);
    await middleware(mockContext as any, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid headers',
      errors: expect.any(Object),
    });
  });

  it('should work with complex zod schema', async () => {
    const headerSchema = z.object({
      'x-api-version': z.enum(['v1', 'v2']),
      'x-user-id': z.string().uuid(),
      authorization: z.string().startsWith('Bearer '),
    });

    mockContext.req.raw.headers = new Headers({
      'x-api-version': 'v1',
      'x-user-id': '123e4567-e89b-12d3-a456-426614174000',
      authorization: 'Bearer valid-token',
    });

    const middleware = validateHeaders(headerSchema);
    await middleware(mockContext as any, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
    expect(mockContext.json).not.toHaveBeenCalled();
  });
});
