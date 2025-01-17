import * as Sentry from '@sentry/react';

let isInitialized = false;

interface InitSentryParams {
  environment: string;
  release: string;
  dsn: string;
  // traceDomains: string[];
}

const initSentry = (options: InitSentryParams) => {
  if (isInitialized) return;

  const { environment, dsn, release } = options;
  const isProduction = environment == 'production';

  Sentry.init({
    dsn,
    environment,
    release,
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

const loadReplayIntegration = async () => {
  import('@sentry/react').then(lazyLoadedSentry => {
    Sentry.addIntegration(lazyLoadedSentry.replayIntegration());
  });
};

export { initSentry, loadReplayIntegration };
