import hooks from './universal';
import {
  SAudioPlayerAudioItem,
  SAudioPlayerInputs,
  SAudioPlayerLoopMode,
  commonHelpers,
  requestHelpers,
  ErrorBoundary,
} from './universal';
import { queryHooks as watchQueryHooks } from './watch';
import { mutationHooks as watchMutationHooks } from './watch';
import { queryHooks as listenQueryHooks } from './listen';
export * as Auth from './providers/auth';
export * as Query from './providers/query';
export { commonHelpers, requestHelpers };

export { watchQueryHooks, watchMutationHooks, listenQueryHooks };

export { ErrorBoundary };
export type { SAudioPlayerAudioItem, SAudioPlayerInputs, SAudioPlayerLoopMode };
export default hooks;
