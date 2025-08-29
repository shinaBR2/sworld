/* istanbul ignore file */

import { useCountdown } from './useCooldown';
import useSAudioPlayer, {
  type SAudioPlayerAudioItem,
  type SAudioPlayerInputs,
  type SAudioPlayerLoopMode,
} from './useSAudioPlayer';

export type { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode };

const hooks = { useSAudioPlayer, useCountdown };
export default hooks;
