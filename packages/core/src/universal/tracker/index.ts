import * as Sentry from '@sentry/react';
import { AppError } from '../error-boundary/app-error';

let isInitialized = false;

interface InitSentryParams {
  environment: string;
  release: string;
  dsn: string;
  site: string;
  // traceDomains: string[];
}

const initSentry = (options: InitSentryParams) => {
  if (isInitialized) return;
  if (options.environment == 'local') return;

  const { environment, dsn, site, release } = options;
  const isProduction = environment == 'production';

  Sentry.init({
    dsn,
    environment,
    release,
    initialScope: {
      tags: {
        site,
      },
    },
    integrations: [Sentry.browserTracingIntegration()],
    // Tracing
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    // tracePropagationTargets: traceDomains,
    // Session Replay
    replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
  });

  isInitialized = true;
};

const loadSentryIntegrations = async () => {
  try {
    import('@sentry/react').then(lazyLoadedSentry => {
      Sentry.addIntegration(lazyLoadedSentry.replayIntegration());
      Sentry.addIntegration(lazyLoadedSentry.feedbackIntegration());
    });
  } catch (error) {
    console.error('Failed to load Sentry integrations:', error);
  }
};

interface ErrorTag {
  key: string;
  value: string | number | boolean;
}

interface CaptureErrorOptions {
  tags?: ErrorTag[];
  extras?: Record<string, unknown>;
  fingerprint?: string[];
}

const captureError = (error: AppError, options: CaptureErrorOptions = {}): void => {
  const { tags = [], extras = {}, fingerprint = ['{{ default }}'] } = options;

  Sentry.withScope(scope => {
    scope.setExtras({
      errorMessage: error.errorMessage,
      canRetry: error.canRetry,
      ...extras,
    });

    tags.forEach(tag => {
      scope.setTag(tag.key, String(tag.value));
    });

    scope.setFingerprint(fingerprint);

    Sentry.captureException(error);
  });
};

export { initSentry, loadSentryIntegrations, captureError };
