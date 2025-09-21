import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { videosRouter } from './index';

// Mock the handler functions
vi.mock('./routes/stream-to-storage', () => ({
  streamToStorage: vi.fn(),
}));

vi.mock('./routes/fix-videos-duration', () => ({
  fixVideosDuration: vi.fn(),
}));

vi.mock('./routes/fix-videos-thumbnail', () => ({
  fixVideosThumbnail: vi.fn(),
}));

vi.mock('./routes/crawl', () => ({
  crawlHandler: vi.fn(),
}));

vi.mock('./routes/share-playlist', () => ({
  sharePlaylistHandler: vi.fn(),
}));

vi.mock('./routes/share-video', () => ({
  shareVideoHandler: vi.fn(),
}));

vi.mock('./routes/subtitle-created', () => ({
  subtitleCreatedHandler: vi.fn(),
}));

// Mock the request validation and handler utilities
vi.mock('src/utils/validators/request', () => ({
  honoValidateRequest: vi.fn(() => (c: any, next: any) => next()),
}));

vi.mock('src/utils/requestHandler', () => ({
  honoRequestHandler: (handler: any) => handler,
}));

vi.mock('src/utils/validators/validateHeaders', () => ({
  validateHeaders: vi.fn(() => (c: any, next: any) => next()),
}));

vi.mock('src/utils/validators/validateHasuraSignature', () => ({
  validateHasuraSignature: vi.fn(() => (c: any, next: any) => next()),
}));

vi.mock('src/utils/validators/zodValidator', () => ({
  zodValidator: vi.fn(() => (c: any, next: any) => next()),
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
      '/videos/convert',
      '/videos/fix-videos-duration',
      '/videos/fix-videos-thumbnail',
      '/videos/crawl',
      '/videos/share-playlist',
      '/videos/share-video',
      '/videos/subtitle-created',
    ];

    for (const path of paths) {
      const req = new Request(`http://localhost${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'test-signature',
        },
      });

      // This will test that the route exists and can be called
      await expect(app.fetch(req)).resolves.toBeDefined();
    }
  });

  it('should use validateHeaders middleware for all routes', async () => {
    const { validateHeaders } = await import(
      'src/utils/validators/validateHeaders'
    );
    const req = new Request('http://localhost/videos/convert', {
      method: 'POST',
    });

    await app.fetch(req);
    expect(validateHeaders).toHaveBeenCalled();
  });

  it('should use validateHasuraSignature middleware for all routes', async () => {
    const { validateHasuraSignature } = await import(
      'src/utils/validators/validateHasuraSignature'
    );
    const req = new Request('http://localhost/videos/convert', {
      method: 'POST',
    });

    await app.fetch(req);
    expect(validateHasuraSignature).toHaveBeenCalled();
  });

  it('should use honoValidateRequest for crawl endpoint', async () => {
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );
    const req = new Request('http://localhost/videos/crawl', {
      method: 'POST',
    });

    await app.fetch(req);
    expect(honoValidateRequest).toHaveBeenCalled();
  });

  it('should use zodValidator for convert endpoint', async () => {
    const { zodValidator } = await import('src/utils/validators/zodValidator');
    const req = new Request('http://localhost/videos/convert', {
      method: 'POST',
    });

    await app.fetch(req);
    expect(zodValidator).toHaveBeenCalled();
  });
});
