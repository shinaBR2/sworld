/**
 * This should include all core
 */

import hooks from './hooks';
import { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode } from './hooks';
import { compareString, slugify } from './common';
import { ErrorBoundary } from './error-boundary';

const commonHelpers = {
  compareString,
  slugify,
};
const requestHelpers = {
  // callable,
};

import { initSentry, loadSentryIntegrations, captureError } from './tracker';
import { AppError } from './error-boundary/app-error';

export type { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode };

export { initSentry, loadSentryIntegrations, captureError };
export { ErrorBoundary };
export { AppError };
export { commonHelpers, requestHelpers };
export default hooks;
