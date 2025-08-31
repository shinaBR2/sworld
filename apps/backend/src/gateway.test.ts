import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/node';
import { app } from '../src/apps/gateway';
import { logger } from '../src/utils/logger';
import rateLimit from 'express-rate-limit';

vi.mock('@sentry/node');
vi.mock('express-rate-limit', () => ({
  default: vi.fn(() => 'mock-limiter'),
}));
vi.mock('../src/utils/logger');
vi.mock('../src/apps/gateway', () => ({
  app: {
    listen: vi.fn((port, cb) => {
      cb();
      return {
        close: vi.fn((cb) => cb()),
      };
    }),
    use: vi.fn(),
  },
}));
vi.mock('../src/utils/envConfig', () => ({
  envConfig: {
    port: 4000,
  },
}));

describe('Gateway Server', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start server and setup middlewares', async () => {
    await import('../src/gateway');

    expect(Sentry.setupExpressErrorHandler).toHaveBeenCalledWith(app);
    expect(rateLimit).toHaveBeenCalledWith({
      windowMs: 60 * 1000,
      max: 100,
    });
    expect(app.use).toHaveBeenCalledWith('mock-limiter');
    expect(logger.info).toHaveBeenCalledWith('Gateway is running on port 4000');
  });

  it('should handle shutdown signals gracefully', async () => {
    const processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const setTimeoutSpy = vi
      .spyOn(global, 'setTimeout')
      .mockImplementation(() => ({ unref: vi.fn() }) as any);

    await import('../src/gateway');

    process.emit('SIGINT', 'SIGINT');
    expect(processExitSpy).toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10000);

    process.emit('SIGTERM', 'SIGTERM');
    expect(processExitSpy).toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10000);

    processExitSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });
});
