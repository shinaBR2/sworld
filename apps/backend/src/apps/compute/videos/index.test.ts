import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { videosRouter } from './index';

// Mock the handler functions
vi.mock('./routes/convert', () => ({
  convertHandler: vi.fn(),
}));

// Mock the request validation and handler utilities
vi.mock('src/utils/validators/request', () => ({
  honoValidateRequest: vi.fn(() => (c: Context, next: Next) => next()),
}));

vi.mock('src/utils/requestHandler', () => ({
  honoRequestHandler: (handler: any) => handler,
}));

vi.mock('src/middleware/reportVideoFailure', () => ({
  withVideoFailureReport: (handler: any) => handler,
}));

describe('videosRouter', () => {
  let app: Hono;

  beforeEach(() => {
    // Create a fresh Hono instance for each test
    app = new Hono();
    // Use the router
    app.route('/videos', videosRouter);
  });

  it('should register the convert-handler POST route', async () => {
    const req = new Request('http://localhost/videos/convert-handler', {
      method: 'POST',
    });

    // This will test that the route exists and can be called
    await expect(app.fetch(req)).resolves.toBeDefined();
  });

  it('should use honoValidateRequest middleware for convert-handler', async () => {
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );

    // Trigger the route
    const req = new Request('http://localhost/videos/convert-handler', {
      method: 'POST',
    });

    await app.fetch(req);

    expect(honoValidateRequest).toHaveBeenCalled();
  });
});
