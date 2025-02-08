/* istanbul ignore file */

import useSAudioPlayer, { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode } from './useSAudioPlayer';
import { useCountdown } from './useCooldown';

export type { SAudioPlayerInputs, SAudioPlayerAudioItem, SAudioPlayerLoopMode };

const hooks = { useSAudioPlayer, useCountdown };
export default hooks;
