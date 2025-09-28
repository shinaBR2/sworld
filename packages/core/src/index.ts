import { queryHooks as listenQueryHooks } from './listen';
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

export { listenQueryHooks, watchMutationHooks, watchQueryHooks };

export { ErrorBoundary };
export type { SAudioPlayerAudioItem, SAudioPlayerInputs, SAudioPlayerLoopMode };
export default hooks;
