import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pino } from 'pino';
import pinoHttp from 'pino-http';

// Mock pino and pino-http
vi.mock('pino', () => ({
  pino: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

vi.mock('pino-http', () => {
  const mockPinoHttp: any = vi.fn((options: any) => {
    mockPinoHttp.lastOptions = options;
    return (req: any, res: any, next: any) => next();
  });
  return { default: mockPinoHttp };
});

describe('logger', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('logger configuration', () => {
    it('should create logger with default config', async () => {
      const { logger } = await import('./logger');

      expect(pino).toHaveBeenCalledWith({
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      });
    });

    it('should use LOG_LEVEL from environment', async () => {
      process.env.LOG_LEVEL = 'debug';

      // Clear module cache to reload with new env
      vi.resetModules();

      const { logger } = await import('./logger');

      expect(pino).toHaveBeenCalledWith({
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      });
    });
  });

  describe('httpLogger configuration', () => {
    let httpLoggerConfig: any;

    beforeEach(async () => {
      vi.resetModules();
      const { httpLogger } = await import('./logger');
      httpLoggerConfig = (pinoHttp as any).lastOptions;
    });

    it('should create http logger with correct config', () => {
      expect(httpLoggerConfig).toEqual(
        expect.objectContaining({
          customProps: expect.any(Function),
          redact: expect.arrayContaining([
            'req.headers["authorization"]',
            'req.headers["x-signature"]',
            'req.headers["x-hub-signature"]',
            'req.headers["x-webhook-signature"]',
            'req.body.*.token',
            'req.body.*.password',
            'req.body.*.secret',
            'req.body.*.key',
          ]),
          serializers: expect.objectContaining({
            req: expect.any(Function),
          }),
        }),
      );
    });

    it('should extract cloud event properties correctly', () => {
      const mockReq = {
        headers: {
          'ce-id': 'test-id',
          'ce-type': 'test-type',
          'ce-source': 'test-source',
          'x-cloud-trace-context': 'test-trace',
        },
      };

      const props = httpLoggerConfig.customProps(mockReq, {});

      expect(props).toEqual({
        cloudEvent: {
          id: 'test-id',
          type: 'test-type',
          source: 'test-source',
        },
        traceId: 'test-trace',
      });
    });

    it('should handle missing cloud event headers', () => {
      const mockReq = {
        headers: {},
      };

      const props = httpLoggerConfig.customProps(mockReq, {});

      expect(props).toEqual({
        cloudEvent: {
          id: undefined,
          type: undefined,
          source: undefined,
        },
        traceId: undefined,
      });
    });

    it('should serialize request correctly', () => {
      const mockReq = {
        method: 'POST',
        url: '/test',
        headers: {
          'ce-type': 'test-event',
          'user-agent': 'test-agent',
        },
        ip: '127.0.0.1',
      };

      const serialized = httpLoggerConfig.serializers.req(mockReq);

      expect(serialized).toEqual({
        method: 'POST',
        url: '/test',
        eventType: 'test-event',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      });
    });

    it('should handle missing request properties', () => {
      const mockReq = {
        headers: {},
      };

      const serialized = httpLoggerConfig.serializers.req(mockReq);

      expect(serialized).toEqual({
        method: undefined,
        url: undefined,
        eventType: undefined,
        ip: undefined,
        userAgent: undefined,
      });
    });
  });
});
