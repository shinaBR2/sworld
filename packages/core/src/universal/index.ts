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
// import { callable } from "./request";

const commonHelpers = {
  compareString,
};
const requestHelpers = {
  // callable,
};

import { initSentry, loadReplayIntegration } from './tracker';

export type { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode };

export { initSentry, loadReplayIntegration };
export { commonHelpers, requestHelpers };
export default hooks;
