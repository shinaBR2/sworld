/**
 * This should include all core
 */

import { compareString, slugify } from './common';
import { ErrorBoundary } from './error-boundary';
import hooks, {
  type SAudioPlayerAudioItem,
  type SAudioPlayerInputs,
  type SAudioPlayerLoopMode,
} from './hooks';

const commonHelpers = {
  compareString,
  slugify,
};
const requestHelpers = {
  // callable,
};

import { AppError } from './error-boundary/app-error';

export type { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode };

export { ErrorBoundary };
export { AppError };
export { commonHelpers, requestHelpers };
export default hooks;
