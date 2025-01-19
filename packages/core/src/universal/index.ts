/**
 * This should include all core
 */

import hooks from './hooks';
import {
  SAudioPlayerInputs,
  SAudioPlayerAudioItem,
  SAudioPlayerLoopMode,
} from './hooks';
import { compareString } from './common';
import { ErrorBoundary } from './error-boundary';

const commonHelpers = {
  compareString,
};
const requestHelpers = {
  // callable,
};

import { initSentry, loadSentryIntegrations, captureError } from './tracker';

export type { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode };

export { initSentry, loadSentryIntegrations, captureError };
export { ErrorBoundary };
export { commonHelpers, requestHelpers };
export default hooks;
