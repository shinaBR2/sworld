import hooks from './universal';
import {
  SAudioPlayerAudioItem,
  SAudioPlayerInputs,
  SAudioPlayerLoopMode,
  commonHelpers,
  requestHelpers,
} from './universal';
import { queryHooks as watchQueryHooks } from './watch';
import { queryHooks as listenQueryHooks } from './listen';
export * as Auth from './providers/auth0';
export * as Query from './providers/query';
export { commonHelpers, requestHelpers };

export { watchQueryHooks, listenQueryHooks };

export type { SAudioPlayerAudioItem, SAudioPlayerInputs, SAudioPlayerLoopMode };
export default hooks;
