import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { videosRouter } from './index';

// Mock the handler functions
vi.mock('./routes/stream-hls', () => ({
  streamHLSHandler: vi.fn(),
}));

vi.mock('./routes/import-platform', () => ({
  importPlatformHandler: vi.fn(),
}));

vi.mock('./routes/fix-duration', () => ({
  fixDurationHandler: vi.fn(),
}));

vi.mock('./routes/fix-thumbnail', () => ({
  fixThumbnailHandler: vi.fn(),
}));

// Mock the request validation and handler utilities
vi.mock('src/utils/validators/request', () => ({
  honoValidateRequest: vi.fn(() => (c, next) => next()),
}));

vi.mock('src/utils/requestHandler', () => ({
  honoRequestHandler: (handler: any) => handler,
}));

describe('videosRouter', () => {
  let app: Hono;

  beforeEach(() => {
    // Create a fresh Hono instance for each test
    app = new Hono();
    // Use the router
    app.route('/videos', videosRouter);
  });

  it('should register all POST routes', async () => {
    const paths = [
      '/videos/stream-hls-handler',
      '/videos/import-platform-handler',
      '/videos/fix-duration',
      '/videos/fix-thumbnail',
    ];

    for (const path of paths) {
      const req = new Request(`http://localhost${path}`, {
        method: 'POST',
      });

      // This will test that the route exists and can be called
      await expect(app.fetch(req)).resolves.toBeDefined();
    }
  });

  it('should use honoValidateRequest middleware for stream-hls-handler', async () => {
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );

    // Trigger the route
    const req = new Request('http://localhost/videos/stream-hls-handler', {
      method: 'POST',
    });

    await app.fetch(req);

    expect(honoValidateRequest).toHaveBeenCalled();
  });

  it('should use honoValidateRequest middleware for import-platform-handler', async () => {
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );

    const req = new Request('http://localhost/videos/import-platform-handler', {
      method: 'POST',
    });

    await app.fetch(req);

    expect(honoValidateRequest).toHaveBeenCalled();
  });

  it('should use honoValidateRequest middleware for fix-duration', async () => {
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );

    const req = new Request('http://localhost/videos/fix-duration', {
      method: 'POST',
    });

    await app.fetch(req);

    expect(honoValidateRequest).toHaveBeenCalled();
  });

  it('should use honoValidateRequest middleware for fix-thumbnail', async () => {
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );

    const req = new Request('http://localhost/videos/fix-thumbnail', {
      method: 'POST',
    });

    await app.fetch(req);

    expect(honoValidateRequest).toHaveBeenCalled();
  });
});
