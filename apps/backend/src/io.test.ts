import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Hono and its methods
const mockUse = vi.fn();
const mockGet = vi.fn();
const mockRoute = vi.fn();
const mockOnError = vi.fn();

// Mock the serve function
const mockServe = vi
  .fn()
  .mockImplementation(
    (options: { port: number }, callback: (info: { port: number }) => void) => {
      if (callback) {
        callback({ port: options.port });
      }
      return { close: vi.fn() };
    },
  );

vi.mock('@hono/node-server', () => ({
  serve: mockServe,
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

// Mock environment variables
vi.mock('./utils/envConfig', () => ({
  envConfig: {
    port: '4000',
    nodeEnv: 'test',
    server: {
      maxBodyLimitInKBNumber: 1024,
    },
    sentrydsn: 'test-dsn',
  },
}));

// Mock the logger
const mockLogger = {
  error: vi.fn(),
};

vi.mock('./utils/logger', () => ({
  createHonoLoggingMiddleware: () => vi.fn(),
  getCurrentLogger: () => mockLogger,
}));

// Mock the routers
vi.mock('./apps/io/videos', () => ({
  videosRouter: 'mockVideosRouter',
}));

vi.mock('./apps/io/crawler', () => ({
  crawlerRouter: 'mockCrawlerRouter',
}));

// Mock sentry
vi.mock('@hono/sentry', () => ({
  sentry: () => vi.fn(),
}));

// Mock body-limit
vi.mock('hono/body-limit', () => ({
  bodyLimit: () => vi.fn(),
}));

// Mock context-storage
const mockContextStorage = vi.fn();
vi.mock('hono/context-storage', () => ({
  contextStorage: () => mockContextStorage,
}));

// Mock request-id
vi.mock('hono/request-id', () => ({
  requestId: () => vi.fn(),
}));

// Mock rate limiter
vi.mock('hono-rate-limiter', () => ({
  rateLimiter: () => vi.fn(),
}));

describe('IO Application', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Import the app after setting up mocks
    await import('./io');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start the server with the correct port', () => {
    expect(mockServe).toHaveBeenCalledWith(
      {
        fetch: expect.any(Function),
        port: 4000,
      },
      expect.any(Function),
    );
  });

  it('should set up middleware', () => {
    // Should call use for each middleware:
    // 1. contextStorage
    // 2. requestId
    // 3. createHonoLoggingMiddleware
    // 4. bodyLimit
    // 5. sentry
    // 6. rateLimiter
    expect(mockUse).toHaveBeenCalledTimes(6);
  });

  it('should use contextStorage middleware', () => {
    // Get the first middleware registration (contextStorage should be first)
    const firstMiddlewareCall = mockUse.mock.calls[0];
    expect(firstMiddlewareCall[0]).toBe('*');
    // The second argument should be our mock contextStorage function
    expect(firstMiddlewareCall[1]).toBe(mockContextStorage);
  });

  it('should register the health check endpoint', () => {
    expect(mockGet).toHaveBeenCalledWith('/hz', expect.any(Function));
  });

  it('should register all routers', () => {
    expect(mockRoute).toHaveBeenCalledWith('videos', 'mockVideosRouter');
    expect(mockRoute).toHaveBeenCalledWith('crawlers', 'mockCrawlerRouter');
  });

  it('should set up error handling', () => {
    // Verify onError was called with a function
    expect(mockOnError).toHaveBeenCalledWith(expect.any(Function));

    // Get the error handler function that was passed to onError
    const errorHandler = mockOnError.mock.calls[0][0];

    // Create a mock context
    const mockJson = vi.fn();
    const mockCtx = {
      json: mockJson,
    };

    // Test the error handler
    const testError = new Error('Test error');
    errorHandler(testError, mockCtx);

    // Verify the error was logged
    expect(mockLogger.error).toHaveBeenCalledWith(testError);

    // Verify the response
    expect(mockJson).toHaveBeenCalledWith({ error: 'Test error' }, 500);
  });
});
