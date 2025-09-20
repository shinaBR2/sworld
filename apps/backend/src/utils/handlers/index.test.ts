// tests/unit/utils/handlers.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Context } from 'hono';
import { requestHandler } from './index';

// Mock Hono context
const createMockContext = (data: any) =>
  ({
    req: {
      valid: vi.fn().mockReturnValue(data),
    },
    json: vi.fn().mockReturnThis(),
  }) as unknown as Context;

describe('requestHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call handler with validated data', async () => {
    const mockData = { id: '123', name: 'Test' };
    const mockHandler = vi.fn().mockResolvedValue({ success: true });
    const mockContext = createMockContext(mockData);

    const handler = requestHandler(mockHandler);
    await handler(mockContext);

    expect(mockContext.req.valid).toHaveBeenCalledWith('json');
    expect(mockHandler).toHaveBeenCalledWith(mockData);
  });

  it('should return handler result as JSON', async () => {
    const mockData = { id: '123' };
    const mockResult = { success: true, data: mockData };
    const mockHandler = vi.fn().mockResolvedValue(mockResult);
    const mockContext = createMockContext(mockData);

    const handler = requestHandler(mockHandler);
    await handler(mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(mockResult);
  });

  it('should handle async handlers', async () => {
    const mockData = { id: '123' };
    const mockResult = { success: true };
    const mockHandler = vi.fn().mockResolvedValue(mockResult);
    const mockContext = createMockContext(mockData);

    const handler = requestHandler(mockHandler);
    await handler(mockContext);

    expect(mockHandler).toHaveBeenCalledWith(mockData);
    expect(mockContext.json).toHaveBeenCalledWith(mockResult);
  });

  it('should handle sync handlers', async () => {
    const mockData = { id: '123' };
    const mockResult = { success: true };
    const mockHandler = vi.fn().mockReturnValue(mockResult);
    const mockContext = createMockContext(mockData);

    const handler = requestHandler(mockHandler);
    await handler(mockContext);

    expect(mockHandler).toHaveBeenCalledWith(mockData);
    expect(mockContext.json).toHaveBeenCalledWith(mockResult);
  });

  it('should handle errors from handler', async () => {
    const mockData = { id: '123' };
    const error = new Error('Test error');
    const mockHandler = vi.fn().mockRejectedValue(error);
    const mockContext = createMockContext(mockData);

    const handler = requestHandler(mockHandler);
    await expect(handler(mockContext)).rejects.toThrow('Test error');
  });
});
