import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

// Mock the serve function
vi.mock('@hono/node-server', () => ({
  serve: vi.fn().mockImplementation((options, callback) => {
    if (callback) {
      callback({ port: options.port });
    }
    return { close: vi.fn() };
  }),
}));

// Mock the Hono app methods
const mockUse = vi.fn();
const mockGet = vi.fn();
const mockRoute = vi.fn();
const mockOnError = vi.fn();

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
vi.mock('./utils/logger', () => ({
  getCurrentLogger: () => ({
    error: vi.fn(),
  }),
  createHonoLoggingMiddleware: () => vi.fn(),
}));

// Mock the routers
vi.mock('./apps/gateway/videos', () => ({
  videosRouter: 'mockVideosRouter',
}));

vi.mock('./apps/gateway/hashnode', () => ({
  hashnodeRouter: 'mockHashnodeRouter',
}));

vi.mock('./apps/gateway/auth', () => ({
  authRouter: 'mockAuthRouter',
}));

// Mock sentry
vi.mock('@hono/sentry', () => ({
  sentry: () => vi.fn(),
}));

// Mock bodyLimit
vi.mock('hono/body-limit', () => ({
  bodyLimit: () => vi.fn(),
}));

// Mock request-id
vi.mock('hono/request-id', () => ({
  requestId: () => vi.fn(),
}));

// Mock rate limiter
vi.mock('hono-rate-limiter', () => ({
  rateLimiter: () => vi.fn(),
}));

describe('Gateway Application', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Import the app after setting up mocks
    await import('./gateway');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start the server with the correct port', () => {
    expect(serve).toHaveBeenCalledWith(
      {
        fetch: expect.any(Function),
        port: 4000,
      },
      expect.any(Function),
    );
  });

  it('should set up middleware', () => {
    // Should call use for each middleware
    expect(mockUse).toHaveBeenCalledTimes(5);
  });

  it('should register the health check endpoint', () => {
    expect(mockGet).toHaveBeenCalledWith('/hz', expect.any(Function));
  });

  it('should register all routers', () => {
    expect(mockRoute).toHaveBeenCalledWith('/videos', 'mockVideosRouter');
    expect(mockRoute).toHaveBeenCalledWith('/hashnode', 'mockHashnodeRouter');
    expect(mockRoute).toHaveBeenCalledWith('/auth', 'mockAuthRouter');
  });

  it('should set up error handling', () => {
    expect(mockOnError).toHaveBeenCalledWith(expect.any(Function));
  });
});
