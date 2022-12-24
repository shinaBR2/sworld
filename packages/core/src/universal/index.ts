/**
 * This should include all core
 */
import hooks from "./hooks";
import {
  SAudioPlayerInputs,
  SAudioPlayerAudioItem,
  SAudioPlayerLoopMode,
} from "./hooks";
import { compareString } from "./common";

const commonHelpers = {
  compareString,
};

export type { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode };

export { commonHelpers };
export default hooks;
