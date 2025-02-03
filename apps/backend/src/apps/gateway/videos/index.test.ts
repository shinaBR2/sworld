import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validateRequest } from 'src/utils/validator';
import { streamToStorage } from './routes/stream-to-storage';

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

describe('videosRouter', () => {
  beforeEach(() => {
    routeHandlers = [];
    vi.clearAllMocks();
    vi.resetModules();
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

    // Check validation middleware was called
    expect(validateRequest).toHaveBeenCalledTimes(1);

    // Verify the streamToStorage handler is set
    expect(convertRoute?.middlewares[1]).toBe(streamToStorage);
  });
});
