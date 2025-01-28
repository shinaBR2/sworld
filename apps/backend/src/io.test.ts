import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/node';
import { app } from '../src/apps/io';
import { logger } from '../src/utils/logger';

vi.mock('@sentry/node');
vi.mock('../src/utils/logger');
vi.mock('../src/apps/io', () => ({
  app: {
    listen: vi.fn((port, cb) => {
      cb();
      return {
        close: vi.fn(cb => cb()),
      };
    }),
  },
}));
vi.mock('../src/utils/envConfig', () => ({
  envConfig: {
    port: 4000,
  },
}));

describe('IO Server', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start server with Sentry error handler', async () => {
    await import('../src/io');

    expect(Sentry.setupExpressErrorHandler).toHaveBeenCalledWith(app);
    expect(logger.info).toHaveBeenCalledWith(
      'IO service is running on port 4000'
    );
  });

  it('should handle shutdown signals gracefully', async () => {
    const processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const setTimeoutSpy = vi
      .spyOn(global, 'setTimeout')
      .mockImplementation(() => ({ unref: vi.fn() }) as any);

    await import('../src/io');

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
