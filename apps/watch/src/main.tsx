import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { routeTree } from './routeTree.gen';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Auth, ErrorBoundary, Query, initSentry, loadSentryIntegrations } from 'core';
import { UniversalMinimalismThemeProvider } from 'ui/universal/minimalism';
import { ErrorFallback } from 'ui/universal/error-boundary';
import { auth0Config, queryConfig, sentryConfig, validateEnvVars } from './config';

validateEnvVars();
initSentry(sentryConfig);

// @ts-ignore
const router = createRouter({
  routeTree,
  defaultViewTransition: true,
  defaultPreload: 'intent',
  context: {
    auth: undefined!,
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  const auth = Auth.useAuthContext();

  return <RouterProvider router={router} context={{ auth }} />;
};

const AppWrapper = () => {
  useEffect(() => {
    loadSentryIntegrations();
  }, []);

  return (
    <StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Auth.AuthProvider config={auth0Config}>
          <Query.QueryProvider config={queryConfig}>
            <UniversalMinimalismThemeProvider>
              <App />
            </UniversalMinimalismThemeProvider>
          </Query.QueryProvider>
        </Auth.AuthProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<AppWrapper />);
