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

export type { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode };

export { commonHelpers, requestHelpers };
export default hooks;
