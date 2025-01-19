import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import * as Sentry from '@sentry/react';
import { initSentry, loadSentryIntegrations, captureError } from './index';
import { AppError } from '../error-boundary/app-error';

// Mock Sentry module
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  withScope: vi.fn(),
  captureException: vi.fn(),
  addIntegration: vi.fn(),
  browserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
  feedbackIntegration: vi.fn(),
}));

describe('Sentry Module', () => {
  const mockOptions = {
    environment: 'production',
    release: '1.0.0',
    dsn: 'https://test@test.ingest.sentry.io/123',
    site: 'test-site',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Reset the module to clear isInitialized state
    vi.resetModules();
  });

  describe('initSentry', () => {
    it('should initialize Sentry with correct options in production', () => {
      initSentry(mockOptions);

      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: mockOptions.dsn,
        environment: mockOptions.environment,
        release: mockOptions.release,
        initialScope: {
          tags: {
            site: mockOptions.site,
          },
        },
        integrations: [expect.any(Function)],
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    });

    it('should initialize Sentry with development sampling rates', () => {
      const devOptions = { ...mockOptions, environment: 'development' };
      initSentry(devOptions);

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 1.0,
        })
      );
    });

    it('should not initialize Sentry for invalid environment', () => {
      initSentry({ ...mockOptions, environment: 'invalid' });
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('should not initialize Sentry multiple times', () => {
      initSentry(mockOptions);
      initSentry(mockOptions);
      expect(Sentry.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadSentryIntegrations', () => {
    it('should load and add Sentry integrations', async () => {
      await loadSentryIntegrations();

      expect(Sentry.addIntegration).toHaveBeenCalledTimes(2);
      expect(Sentry.replayIntegration).toHaveBeenCalled();
      expect(Sentry.feedbackIntegration).toHaveBeenCalled();
    });

    it('should handle integration loading errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock import to fail
      vi.mock('@sentry/react', () => {
        throw new Error('Import failed');
      });

      await loadSentryIntegrations();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load Sentry integrations:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('captureError', () => {
    const mockError = new AppError('Test error', 'Test error message', true);

    const mockScope = {
      setExtras: vi.fn(),
      setTag: vi.fn(),
      setFingerprint: vi.fn(),
    };

    beforeEach(() => {
      // Setup withScope mock for each test
      (Sentry.withScope as Mock).mockImplementation(callback => {
        callback(mockScope);
      });
    });

    it('should capture error with default options', () => {
      captureError(mockError);

      expect(Sentry.withScope).toHaveBeenCalled();
      expect(mockScope.setExtras).toHaveBeenCalledWith({
        errorMessage: mockError.errorMessage,
        canRetry: mockError.canRetry,
      });
      expect(mockScope.setFingerprint).toHaveBeenCalledWith(['{{ default }}']);
      expect(Sentry.captureException).toHaveBeenCalledWith(mockError);
    });

    it('should capture error with custom tags', () => {
      const mockTags = [
        { key: 'testKey', value: 'testValue' },
        { key: 'numericKey', value: 123 },
      ];

      captureError(mockError, { tags: mockTags });

      expect(mockScope.setTag).toHaveBeenCalledWith('testKey', 'testValue');
      expect(mockScope.setTag).toHaveBeenCalledWith('numericKey', '123');
      expect(Sentry.captureException).toHaveBeenCalledWith(mockError);
    });

    it('should capture error with custom extras', () => {
      const mockExtras = {
        additionalInfo: 'test',
        customValue: 123,
      };

      captureError(mockError, { extras: mockExtras });

      expect(mockScope.setExtras).toHaveBeenCalledWith({
        errorMessage: mockError.errorMessage,
        canRetry: mockError.canRetry,
        ...mockExtras,
      });
      expect(Sentry.captureException).toHaveBeenCalledWith(mockError);
    });

    it('should capture error with custom fingerprint', () => {
      const mockFingerprint = ['custom', 'fingerprint'];

      captureError(mockError, { fingerprint: mockFingerprint });

      expect(mockScope.setFingerprint).toHaveBeenCalledWith(mockFingerprint);
      expect(Sentry.captureException).toHaveBeenCalledWith(mockError);
    });
  });
});
