import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { routeTree } from './routeTree.gen';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { ErrorBoundary, Query } from 'core';
import { UniversalMinimalismThemeProvider } from 'ui/universal/minimalism';
import { ErrorFallback } from 'ui/universal/error-boundary';
import { queryConfig, rollbarConfig, validateEnvVars } from './config';

validateEnvVars();

const router = createRouter({
  routeTree,
  defaultViewTransition: true,
  defaultPreload: 'intent',
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  return <RouterProvider router={router} />;
};

const AppWrapper = () => {
  return (
    <StrictMode>
      <ErrorBoundary config={rollbarConfig} FallbackComponent={ErrorFallback}>
        <Query.QueryProvider config={queryConfig}>
          <UniversalMinimalismThemeProvider>
            <App />
          </UniversalMinimalismThemeProvider>
        </Query.QueryProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<AppWrapper />);
