import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validateRequest } from 'src/utils/validator';
import { streamToStorage } from './routes/stream-to-storage';
import { fixVideosDuration } from './routes/fix-videos-duration';

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

vi.mock('src/utils/validator', () => ({
  validateRequest: vi.fn().mockImplementation(schema => {
    return (req: any, res: any, next: any) => {
      req.validatedData = req.body;
      next();
    };
  }),
}));

vi.mock('./routes/stream-to-storage', () => ({
  streamToStorage: vi.fn(),
}));

vi.mock('./routes/fix-videos-duration', () => ({
  fixVideosDuration: vi.fn(),
}));

describe('videosRouter', () => {
  beforeEach(() => {
    routeHandlers = [];
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should validate all requests', async () => {
    await import('./index');
    // Check validation middleware was called
    expect(validateRequest).toHaveBeenCalledTimes(2);
    const calls = (validateRequest as any).mock.calls;
    expect(calls[0][0]).toBeDefined(); // Check convert route schema
    expect(calls[1][0]).toBeDefined(); // Check fix-videos-duration route schema
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
});
