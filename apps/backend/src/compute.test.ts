import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serve } from '@hono/node-server';

// Mock external modules
vi.mock('@hono/node-server');
vi.mock('@hono/sentry');
vi.mock('hono/body-limit');
vi.mock('hono/context-storage');
vi.mock('hono/request-id');
vi.mock('hono-rate-limiter');
vi.mock('src/utils/envConfig');
vi.mock('src/utils/logger', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };

  return {
    logger: mockLogger,
    getCurrentLogger: vi.fn(() => mockLogger),
    createHonoLoggingMiddleware: vi.fn(() => vi.fn()),
  };
});

// Mock the videos router
const mockVideosRouter = {};
vi.mock('./apps/compute/videos', () => ({
  videosRouter: mockVideosRouter,
}));

// Mock Hasura client
vi.mock('src/services/hasura/client', () => ({
  createHasuraClient: vi.fn().mockReturnValue({
    request: vi.fn().mockResolvedValue({}),
  }),
}));

// Mock Hono app
const mockUse = vi.fn().mockReturnThis();
const mockGet = vi.fn().mockReturnThis();
const mockRoute = vi.fn().mockReturnThis();
const mockOnError = vi.fn().mockReturnThis();

// Mock contextStorage
const mockContextStorage = vi.fn();
vi.mock('hono/context-storage', () => ({
  contextStorage: () => mockContextStorage,
}));

vi.mock('hono', () => ({
  Hono: vi.fn(() => ({
    use: mockUse,
    get: mockGet,
    route: mockRoute,
    onError: mockOnError,
    fetch: vi.fn(),
  })),
}));

describe('Compute Application', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Mock environment
    originalEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.HASURA_GRAPHQL_ENDPOINT = 'http://localhost:8080/v1/graphql';
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'test-secret';
    process.env.SENTRY_DSN = 'test-dsn';
    process.env.RATE_LIMIT_WINDOW_MS = '900000';
    process.env.RATE_LIMIT_MAX = '100';

    // Mock serve implementation
    (serve as any).mockImplementation((options: any, callback: any) => {
      if (callback) {
        callback({ port: options.port });
      }
      return { close: vi.fn() };
    });

    // Import the app after setting up mocks
    await import('./compute');
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('should start the server with the correct port', () => {
    // The serve function should be called with the correct port and fetch handler
    expect(serve).toHaveBeenCalledWith(
      {
        fetch: expect.any(Function),
        port: 3000,
      },
      expect.any(Function),
    );
  });

  it('should set up middleware and routes', () => {
    // Verify the server was started with the correct port
    expect(serve).toHaveBeenCalledWith(
      {
        fetch: expect.any(Function),
        port: 3000,
      },
      expect.any(Function),
    );

    // Verify the contextStorage middleware was registered first
    const contextStorageCall = mockUse.mock.calls[1]; // Second call (after requestId)
    expect(contextStorageCall[0]).toBe('*');
    expect(contextStorageCall[1]).toBe(mockContextStorage);

    // Verify the health check endpoint was registered
    expect(mockGet).toHaveBeenCalledWith('/hz', expect.any(Function));

    // Verify the videos router was registered
    expect(mockRoute).toHaveBeenCalledWith('/videos', expect.any(Object));
  });

  it('should register the health check endpoint', () => {
    expect(mockGet).toHaveBeenCalledWith('/hz', expect.any(Function));
  });

  it('should use contextStorage middleware', () => {
    // The contextStorage middleware should be the second middleware registered (after requestId)
    const contextStorageCall = mockUse.mock.calls[1];
    expect(contextStorageCall[0]).toBe('*');
    expect(contextStorageCall[1]).toBe(mockContextStorage);
  });

  it('should register the videos router', () => {
    expect(mockRoute).toHaveBeenCalledWith('/videos', mockVideosRouter);
  });

  it('should set up error handling', () => {
    expect(mockOnError).toHaveBeenCalledWith(expect.any(Function));
  });
});
