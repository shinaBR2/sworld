import hooks from './universal';
import {
  SAudioPlayerAudioItem,
  SAudioPlayerInputs,
  SAudioPlayerLoopMode,
  commonHelpers,
  requestHelpers,
  initSentry,
  loadSentryIntegrations,
  captureError,
  ErrorBoundary,
} from './universal';
import { queryHooks as watchQueryHooks } from './watch';
import { queryHooks as listenQueryHooks } from './listen';
export * as Auth from './providers/auth';
export * as Query from './providers/query';
export { commonHelpers, requestHelpers };

export { watchQueryHooks, listenQueryHooks };
export { initSentry, loadSentryIntegrations, captureError };

export { ErrorBoundary };

export type { SAudioPlayerAudioItem, SAudioPlayerInputs, SAudioPlayerLoopMode };
export default hooks;
