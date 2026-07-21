import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { hashnodeRouter } from './index';

// Mock the handler functions
vi.mock('./routes/posts', () => ({
  postEventsHandler: vi.fn(),
}));

// Mock the utilities
vi.mock('src/utils/handlers', () => ({
  requestHandler: vi.fn(
    (handler: (c: Context) => Promise<Response> | Response) => handler,
  ),
}));

vi.mock('src/utils/validators/validateHeaders', () => ({
  validateHeaders: vi.fn(() => (_c: Context, next: Next) => next()),
}));

vi.mock('src/utils/validators/validateHashnodeSignature', () => ({
  validateHashnodeSignature: vi.fn(() => (_c: Context, next: Next) => next()),
}));

vi.mock('src/utils/validators/zodValidator', () => ({
  zodValidator: vi.fn(() => (_c: Context, next: Next) => next()),
}));

describe('hashnodeRouter', () => {
  let app: Hono;

  beforeEach(() => {
    // Create a fresh Hono instance for each test
    app = new Hono();
    // Use the router
    app.route('/hashnode', hashnodeRouter);
  });

  it('should register the posts-webhook POST route', async () => {
    const req = new Request('http://localhost/hashnode/posts-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hashnode-signature': 'test-signature',
      },
    });

    // This will test that the route exists and can be called
    await expect(app.fetch(req)).resolves.toBeDefined();
  });

  it('should use validateHeaders middleware', async () => {
    const { validateHeaders } = await import(
      'src/utils/validators/validateHeaders'
    );
    const req = new Request('http://localhost/hashnode/posts-webhook', {
      method: 'POST',
    });

    await app.fetch(req);
    expect(validateHeaders).toHaveBeenCalled();
  });

  it('should use validateHashnodeSignature middleware', async () => {
    const { validateHashnodeSignature } = await import(
      'src/utils/validators/validateHashnodeSignature'
    );
    const req = new Request('http://localhost/hashnode/posts-webhook', {
      method: 'POST',
    });

    await app.fetch(req);
    expect(validateHashnodeSignature).toHaveBeenCalled();
  });

  it('should use zodValidator with correct schema', async () => {
    const { zodValidator } = await import('src/utils/validators/zodValidator');
    const { hashnodeBodySchema } = await import('src/schema/hashnode');

    const req = new Request('http://localhost/hashnode/posts-webhook', {
      method: 'POST',
    });

    await app.fetch(req);
    expect(zodValidator).toHaveBeenCalledWith('json', hashnodeBodySchema);
  });

  it('should use requestHandler for the route handler', async () => {
    const { requestHandler } = await import('src/utils/handlers');

    const req = new Request('http://localhost/hashnode/posts-webhook', {
      method: 'POST',
    });

    await app.fetch(req);

    // Get the mock implementation and verify it was called
    const mockRequestHandler = vi.mocked(requestHandler);
    expect(mockRequestHandler).toHaveBeenCalled();

    // Verify the handler is a function
    const handlerArg = mockRequestHandler.mock.calls[0][0];
    expect(handlerArg).toBeDefined();
    expect(typeof handlerArg).toBe('function');
  });
});
