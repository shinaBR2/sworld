import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pino
vi.mock('pino', () => ({
  default: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    child: vi.fn().mockReturnThis(),
  })),
  pino: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    child: vi.fn().mockReturnThis(),
  })),
}));

// Mock pino-http
const mockPinoHttp = vi.fn().mockImplementation((options) => {
  // Store options for assertions
  (mockPinoHttp as any).lastOptions = options;
  // Return a middleware function that immediately calls next()
  return (req: any, res: any, next: () => void) => {
    next();
  };
});
(mockPinoHttp as any).lastOptions = {};

vi.mock('pino-http', () => ({
  default: mockPinoHttp,
}));

// Mock node:async_hooks
const mockGetStore = vi.fn();
const mockRun = vi.fn((_store: unknown, callback: () => void) => callback());
vi.mock('node:async_hooks', () => ({
  AsyncLocalStorage: vi.fn(() => ({
    getStore: mockGetStore,
    run: mockRun,
  })),
}));

describe('logger', () => {
  let loggerModule: typeof import('.');

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    // Re-import the module to reset state
    loggerModule = await import('.');
  });

  describe('getCurrentLogger', () => {
    it('should return a logger instance with expected methods', () => {
      const logger = loggerModule.getCurrentLogger();

      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.warn).toBe('function');
    });
  });

  describe('createHonoLoggingMiddleware', () => {
    it('should create middleware with production config', async () => {
      // Mock the pino-http middleware to call next immediately
      const mockNext = vi.fn();

      const middleware = loggerModule.createHonoLoggingMiddleware({
        nodeEnv: 'production',
      });

      expect(typeof middleware).toBe('function');

      // Create a promise that resolves when next is called
      const nextCalled = new Promise<void>((resolve) => {
        middleware(
          {
            var: { requestId: 'test-request-123' },
            env: { incoming: {}, outgoing: {} },
            req: { headers: {} },
            res: {},
          },
          () => {
            mockNext();
            resolve();
          },
        );
      });

      // Wait for next to be called or timeout after 1s
      await Promise.race([
        nextCalled,
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      expect(mockPinoHttp).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should configure customProps correctly', async () => {
      const middleware = loggerModule.createHonoLoggingMiddleware({
        nodeEnv: 'test',
      });

      const nextCalled = new Promise<void>((resolve) => {
        middleware(
          {
            var: { requestId: 'test-request-123' },
            env: { incoming: {}, outgoing: {} },
            req: { headers: {} },
            res: {},
          },
          resolve,
        );
      });

      await Promise.race([
        nextCalled,
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      const pinoHttpOptions = (mockPinoHttp as any).lastOptions;
      expect(pinoHttpOptions.customProps).toBeDefined();

      // Test customProps function with mock req/res
      const mockReq = {
        headers: {
          'ce-id': 'event-123',
          'ce-type': 'user.created',
          'ce-source': 'user-service',
          'x-cloud-trace-context': 'trace-456',
        },
      };
      const mockRes = {};

      const customProps = pinoHttpOptions.customProps(mockReq, mockRes);

      expect(customProps).toEqual({
        cloudEvent: {
          id: 'event-123',
          type: 'user.created',
          source: 'user-service',
        },
        traceId: 'trace-456',
      });
    });

    it('should configure serializers correctly', async () => {
      const middleware = loggerModule.createHonoLoggingMiddleware({
        nodeEnv: 'test',
      });

      const nextCalled = new Promise<void>((resolve) => {
        middleware(
          {
            var: { requestId: 'test-request-123' },
            env: { incoming: {}, outgoing: {} },
            req: { headers: {} },
            res: {},
          },
          resolve,
        );
      });

      await Promise.race([
        nextCalled,
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      const pinoHttpOptions = (mockPinoHttp as any).lastOptions;
      expect(pinoHttpOptions.serializers).toBeDefined();
      expect(pinoHttpOptions.serializers.req).toBeDefined();

      // Test req serializer
      const mockReq = {
        method: 'POST',
        url: '/api/users',
        ip: '192.168.1.1',
        headers: {
          'ce-type': 'user.created',
          'user-agent': 'Mozilla/5.0 (Test Browser)',
        },
      };

      const serializedReq = pinoHttpOptions.serializers.req(mockReq);

      expect(serializedReq).toEqual({
        method: 'POST',
        url: '/api/users',
        eventType: 'user.created',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Test Browser)',
      });
    });
  });

  describe('sensitive data redaction', () => {
    it('should redact sensitive fields', async () => {
      // Mock the pino-http middleware to capture options
      const middleware = loggerModule.createHonoLoggingMiddleware({
        nodeEnv: 'test',
      });

      // Create a promise that resolves when next is called
      const nextCalled = new Promise<void>((resolve) => {
        middleware(
          {
            var: { requestId: 'test-request-123' },
            env: { incoming: {}, outgoing: {} },
            req: { headers: {} },
            res: {},
          },
          resolve,
        );
      });

      // Wait for next to be called or timeout after 1s
      await Promise.race([
        nextCalled,
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      const pinoHttpOptions = (mockPinoHttp as any).lastOptions;
      expect(pinoHttpOptions).toBeDefined();
      expect(pinoHttpOptions.redact).toBeDefined();

      const sensitiveFields = [
        'req.headers["authorization"]',
        'req.headers["x-signature"]',
        'req.headers["x-hub-signature"]',
        'req.headers["x-webhook-signature"]',
        'req.body.*.token',
        'req.body.*.password',
        'req.body.*.secret',
        'req.body.*.key',
      ];

      sensitiveFields.forEach((field) => {
        expect(pinoHttpOptions.redact).toContain(field);
      });
    });

    it('should include all expected redaction fields', async () => {
      const middleware = loggerModule.createHonoLoggingMiddleware({
        nodeEnv: 'development',
      });

      const nextCalled = new Promise<void>((resolve) => {
        middleware(
          {
            var: { requestId: 'dev-request-456' },
            env: { incoming: {}, outgoing: {} },
            req: { headers: {} },
            res: {},
          },
          resolve,
        );
      });

      await Promise.race([
        nextCalled,
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      const pinoHttpOptions = (mockPinoHttp as any).lastOptions;
      expect(pinoHttpOptions.redact).toHaveLength(8);
      expect(pinoHttpOptions.redact).toEqual([
        'req.headers["authorization"]',
        'req.headers["x-signature"]',
        'req.headers["x-hub-signature"]',
        'req.headers["x-webhook-signature"]',
        'req.body.*.token',
        'req.body.*.password',
        'req.body.*.secret',
        'req.body.*.key',
      ]);
    });
  });

  describe('edge cases for customProps and serializers', () => {
    it('should handle missing headers in customProps', async () => {
      const middleware = loggerModule.createHonoLoggingMiddleware({
        nodeEnv: 'test',
      });

      const nextCalled = new Promise<void>((resolve) => {
        middleware(
          {
            var: { requestId: 'test-request-789' },
            env: { incoming: {}, outgoing: {} },
            req: { headers: {} },
            res: {},
          },
          resolve,
        );
      });

      await Promise.race([
        nextCalled,
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      const pinoHttpOptions = (mockPinoHttp as any).lastOptions;

      // Test with empty headers
      const mockReq = { headers: {} };
      const customProps = pinoHttpOptions.customProps(mockReq, {});

      expect(customProps).toEqual({
        cloudEvent: {
          id: undefined,
          type: undefined,
          source: undefined,
        },
        traceId: undefined,
      });
    });

    it('should handle missing fields in req serializer', async () => {
      const middleware = loggerModule.createHonoLoggingMiddleware({
        nodeEnv: 'test',
      });

      const nextCalled = new Promise<void>((resolve) => {
        middleware(
          {
            var: { requestId: 'test-request-101' },
            env: { incoming: {}, outgoing: {} },
            req: { headers: {} },
            res: {},
          },
          resolve,
        );
      });

      await Promise.race([
        nextCalled,
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      const pinoHttpOptions = (mockPinoHttp as any).lastOptions;

      // Test with minimal req object
      const mockReq = {
        method: 'GET',
        url: '/test',
        headers: {},
      };

      const serializedReq = pinoHttpOptions.serializers.req(mockReq);

      expect(serializedReq).toEqual({
        method: 'GET',
        url: '/test',
        eventType: undefined,
        ip: undefined,
        userAgent: undefined,
      });
    });
  });
});
