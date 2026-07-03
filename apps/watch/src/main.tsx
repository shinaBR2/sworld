import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { Auth, ErrorBoundary, Query } from 'core';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorFallback } from 'ui/universal/error-boundary';
import { UniversalMinimalismThemeProvider } from 'ui/universal/minimalism';
import {
  auth0Config,
  queryConfig,
  rollbarConfig,
  validateEnvVars,
} from './config';
import { routeTree } from './routeTree.gen';
import { readStandaloneCache } from './standalone-mode';

// Trigger a production build to verify the Cloudflare Pages deploy pipeline.
validateEnvVars();

// In standalone mode the router runs on in-memory history so navigation never
// changes the URL or grows the browser history stack, and a refresh always
// lands on home (SWO-326). Decided synchronously at boot from the localStorage
// cache; the default (browser history) is unchanged when off.
const standalone = readStandaloneCache();

// @ts-expect-error
const router = createRouter({
  routeTree,
  history: standalone
    ? createMemoryHistory({ initialEntries: ['/'] })
    : undefined,
  defaultViewTransition: true,
  defaultPreload: 'intent',
  scrollRestoration: true,
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
  return (
    <StrictMode>
      <ErrorBoundary config={rollbarConfig} FallbackComponent={ErrorFallback}>
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
