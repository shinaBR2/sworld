import { NextFunction, Request, Response } from 'express';
import { validateRequest } from 'src/utils/validator';
import { validateRequest as newValidateRequest } from 'src/utils/validators/request';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crawlHandler } from './routes/crawl';
import { fixVideosDuration } from './routes/fix-videos-duration';
import { fixVideosThumbnail } from './routes/fix-videos-thumbnail';
import { streamToStorage } from './routes/stream-to-storage';
import { sharePlaylistHandler } from './routes/share-playlist';
import { shareVideoHandler } from './routes/share-video';
import { subtitleCreatedHandler } from './routes/subtitle-created';

type Middleware = (req: Request, res: Response, next: NextFunction) => void;
let routeHandlers: { path: string; middlewares: Middleware[] }[] = [];

vi.mock('express', () => {
  const mockRouter = {
    post: vi.fn((path, ...middlewares) => {
      routeHandlers.push({ path, middlewares });
    }),
  };

  const mockExpress = vi.fn();
  (mockExpress as any).Router = vi.fn(() => mockRouter);

  return {
    default: mockExpress,
    Router: mockExpress.Router,
    __esModule: true,
  };
});

// Mock the validator modules
vi.mock('src/utils/validator', () => ({
  validateRequest: vi.fn().mockImplementation(schema => (req: any, res: any, next: any) => {
    req.validatedData = req.body;
    next();
  }),
}));

vi.mock('src/utils/validators/request', () => ({
  validateRequest: vi.fn().mockImplementation(schema => (req: any, res: any, next: any) => {
    req.validatedData = req.body;
    next();
  }),
}));

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

describe('videosRouter', () => {
  beforeEach(() => {
    routeHandlers = [];
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should validate all requests', async () => {
    await import('./index');

    // Check validation middleware was called for all endpoints
    // 6 endpoints use validateRequest, 1 uses newValidateRequest
    expect(validateRequest).toHaveBeenCalledTimes(6);

    // Get the mock implementation from the request validator
    const { validateRequest: mockNewValidateRequest } = await import('src/utils/validators/request');
    expect(mockNewValidateRequest).toHaveBeenCalledTimes(1);

    // Check that all validation functions were called with a schema
    const validateCalls = (validateRequest as any).mock.calls;
    const newValidateCalls = (mockNewValidateRequest as any).mock.calls;

    // Check that all validation calls have a schema defined
    [...validateCalls, ...newValidateCalls].forEach(call => {
      expect(call[0]).toBeDefined();
    });

    // Check that we have the right number of validations in total
    expect(validateCalls.length + newValidateCalls.length).toBe(7);
  });

  it('should set up /convert route with correct middleware and handler', async () => {
    // Import to trigger route setup
    const { videosRouter } = await import('./index');
    expect(videosRouter).toBeDefined();

    // Find the /convert route configuration
    const convertRoute = routeHandlers.find(h => h.path === '/convert');
    expect(convertRoute).toBeDefined();

    // Should have 2 middlewares: validation and handler
    expect(convertRoute?.middlewares).toHaveLength(2);

    // Verify the streamToStorage handler is set
    expect(convertRoute?.middlewares[1]).toBe(streamToStorage);
  });

  it('should set up /fix-videos-duration route with correct middleware and handler', async () => {
    const { videosRouter } = await import('./index');
    expect(videosRouter).toBeDefined();

    const durationRoute = routeHandlers.find(h => h.path === '/fix-videos-duration');
    expect(durationRoute).toBeDefined();

    // Should have 2 middlewares: validation and handler
    expect(durationRoute?.middlewares).toHaveLength(2);

    // Verify the fixVideosDuration handler is set
    expect(durationRoute?.middlewares[1]).toBe(fixVideosDuration);
  });

  it('should set up /fix-videos-thumbnail route with correct middleware and handler', async () => {
    const { videosRouter } = await import('./index');
    expect(videosRouter).toBeDefined();

    const durationRoute = routeHandlers.find(h => h.path === '/fix-videos-thumbnail');
    expect(durationRoute).toBeDefined();

    // Should have 2 middlewares: validation and handler
    expect(durationRoute?.middlewares).toHaveLength(2);

    // Verify the fixVideosDuration handler is set
    expect(durationRoute?.middlewares[1]).toBe(fixVideosThumbnail);
  });

  it('should set up /crawl route with correct middleware and handler', async () => {
    const { videosRouter } = await import('./index');
    expect(videosRouter).toBeDefined();

    const crawlRoute = routeHandlers.find(h => h.path === '/crawl');
    expect(crawlRoute).toBeDefined();

    // Should have 2 middlewares: validation and handler
    expect(crawlRoute?.middlewares).toHaveLength(2);

    // Verify the crawlHandler is set
    expect(crawlRoute?.middlewares[1]).toBe(crawlHandler);
  });

  it('should set up /share-playlist route with correct middleware and handler', async () => {
    const { videosRouter } = await import('./index');
    expect(videosRouter).toBeDefined();

    const shareRoute = routeHandlers.find(h => h.path === '/share-playlist');
    expect(shareRoute).toBeDefined();

    // Should have 2 middlewares: validation and handler
    expect(shareRoute?.middlewares).toHaveLength(2);

    // Verify the sharePlaylistHandler is set
    expect(shareRoute?.middlewares[1]).toBe(sharePlaylistHandler);
  });

  it('should set up /share-video route with correct middleware and handler', async () => {
    const { videosRouter } = await import('./index');
    expect(videosRouter).toBeDefined();

    const shareRoute = routeHandlers.find(h => h.path === '/share-video');
    expect(shareRoute).toBeDefined();

    // Should have 2 middlewares: validation and handler
    expect(shareRoute?.middlewares).toHaveLength(2);

    // Verify the shareVideoHandler is set
    expect(shareRoute?.middlewares[1]).toBe(shareVideoHandler);
  });

  it('should set up /subtitle-created route with correct middleware and handler', async () => {
    const { videosRouter } = await import('./index');
    expect(videosRouter).toBeDefined();

    const subtitleRoute = routeHandlers.find(h => h.path === '/subtitle-created');
    expect(subtitleRoute).toBeDefined();

    // Should have 2 middlewares: validation and handler
    expect(subtitleRoute?.middlewares).toHaveLength(2);

    // Verify the request handler is set up correctly
    const mockReq = { body: {} };
    const mockRes = { json: vi.fn() };
    const mockNext = vi.fn();

    // Call the handler
    await subtitleRoute?.middlewares[1](mockReq as any, mockRes as any, mockNext);

    // Verify the handler was called with validated data
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'ok',
      dataObject: undefined, // Since we're mocking the handler
    });
  });
});
