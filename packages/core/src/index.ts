import {
  mutationHooks as listenMutationHooks,
  queryHooks as listenQueryHooks,
} from './listen';
import { queryHooks as lookQueryHooks } from './look';
import hooks, {
  commonHelpers,
  ErrorBoundary,
  requestHelpers,
  type SAudioPlayerAudioItem,
  type SAudioPlayerInputs,
  type SAudioPlayerLoopMode,
} from './universal';
import {
  mutationHooks as watchMutationHooks,
  queryHooks as watchQueryHooks,
} from './watch';

export * as Auth from './providers/auth';
export * as Query from './providers/query';
export { commonHelpers, requestHelpers };

export {
  listenMutationHooks,
  listenQueryHooks,
  lookQueryHooks,
  watchMutationHooks,
  watchQueryHooks,
};

export { ErrorBoundary };
export type { SAudioPlayerAudioItem, SAudioPlayerInputs, SAudioPlayerLoopMode };
export default hooks;
