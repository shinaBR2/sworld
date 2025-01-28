import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/node';
import { app } from '../src/apps/gateway';
import { logger } from '../src/utils/logger';

vi.mock('@sentry/node');
vi.mock('../src/utils/logger');
vi.mock('../src/apps/gateway', () => ({
  app: {
    listen: vi.fn(() => ({
      close: vi.fn(cb => cb()),
    })),
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

  it('should start server on configured port', async () => {
    await import('../src/gateway');
    expect(Sentry.setupExpressErrorHandler).toHaveBeenCalledWith(app);
  });

  it('should handle shutdown signals', async () => {
    const processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    await import('../src/gateway');

    process.emit('SIGINT', 'SIGINT');
    expect(processExitSpy).toHaveBeenCalled();

    processExitSpy.mockRestore();
  });
});
