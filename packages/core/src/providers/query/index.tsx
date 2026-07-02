import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, type FC, useContext, useEffect } from 'react';
import { useFeatureFlagSubscription } from '../../universal/hooks/useFeatureFlagSubscription';
import { useNotificationsSubscription } from '../../universal/hooks/useNotificationsSubscription';
import { useAuthContext } from '../auth';

const queryClient = new QueryClient();

interface QueryContextValue {
  hasuraUrl: string;
  featureFlags: ReturnType<typeof useFeatureFlagSubscription>;
  notifications: ReturnType<typeof useNotificationsSubscription>;
  invalidateQuery: (queryKey: unknown[]) => void;
}

interface Config {
  hasuraUrl: string;
}

interface QueryContextProviderProps {
  config: Config;
  children: React.ReactNode;
}

const QueryContext = createContext<QueryContextValue | undefined>(undefined);
const QueryContextProvider = (props: QueryContextProviderProps) => {
  const { config, children } = props;
  const { hasuraUrl } = config;
  const featureFlags = useFeatureFlagSubscription(hasuraUrl);
  const notifications = useNotificationsSubscription(hasuraUrl);
  const { user } = useAuthContext();
  const userId = user?.id ?? null;

  /**
   * Reset the React Query cache whenever the signed-in user changes.
   *
   * `queryClient` is a module-level singleton and query keys are NOT scoped
   * by userId, so without this the previous identity's data (or anonymous
   * data) keeps being served from cache to the newly signed-in user until
   * staleTime elapses. Clearing on userId change drops those entries; active
   * observers then refetch with the new token. Only the query cache is
   * affected — the feature-flag / notification WebSocket subscriptions are not.
   *
   * userId is the trigger, not a value read inside the effect body.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: userId is the change trigger, not read inside the effect.
  useEffect(() => {
    queryClient.clear();
  }, [userId]);

  const contextValue: QueryContextValue = {
    hasuraUrl,
    featureFlags,
    notifications,
    invalidateQuery: (queryKey: unknown[]) => {
      // For unknown reason, invalidateQueries doesn't work as expected
      // So I use removeQueries and refetchQueries instead

      // First remove the data completely
      queryClient.removeQueries({ queryKey, exact: true });

      // Only need to refetch active queries since others were removed
      queryClient.refetchQueries({
        queryKey,
        exact: true,
        type: 'active',
      });
    },
  };

  return (
    <QueryContext.Provider value={contextValue}>
      {children}
    </QueryContext.Provider>
  );
};

const QueryProvider: FC<QueryContextProviderProps> = ({ config, children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryContextProvider config={config}>{children}</QueryContextProvider>
    </QueryClientProvider>
  );
};

const useQueryContext = (): QueryContextValue => {
  const context = useContext(QueryContext);

  if (!context) {
    throw new Error('useQueryContext must be used within an QueryProvider');
  }

  return context;
};

export type { QueryContextValue };
export { QueryProvider, useQueryContext };
