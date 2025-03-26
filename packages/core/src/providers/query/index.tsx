import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, FC, useContext } from 'react';
import { useFeatureFlagSubscription } from '../../universal/hooks/useFeatureFlagSubscription';
import { useNotificationsSubscription } from '../../universal/hooks/useNotificationsSubscription';

const queryClient = new QueryClient();

interface QueryContextValue {
  hasuraUrl: string;
  featureFlags: ReturnType<typeof useFeatureFlagSubscription>;
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
  const rs = useNotificationsSubscription(hasuraUrl);

  console.log('rs', rs);
  const contextValue: QueryContextValue = {
    hasuraUrl,
    featureFlags,
  };

  return <QueryContext.Provider value={contextValue}>{children}</QueryContext.Provider>;
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
