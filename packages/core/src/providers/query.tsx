import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, FC, useContext } from 'react';

const queryClient = new QueryClient();

interface QueryContextValue {
  hasuraUrl: string;
}

interface Config {
  hasuraUrl: string;
}

const QueryContext = createContext<QueryContextValue | undefined>(undefined);
const QueryContextProvider = (props: { config: Config; children: any }) => {
  const { config, children } = props;
  const { hasuraUrl } = config;
  const contextValue: QueryContextValue = {
    hasuraUrl,
  };

  return (
    <QueryContext.Provider value={contextValue}>
      {children}
    </QueryContext.Provider>
  );
};

const QueryProvider: FC<any> = ({ config, children }) => {
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

export { QueryProvider, useQueryContext };
