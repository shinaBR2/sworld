import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Auth, ErrorBoundary, Query } from 'core';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { MinimalismThemeProvider } from 'ui/listen/minimalism';
import { ErrorFallback } from 'ui/universal/error-boundary';
import {
  auth0Config,
  queryConfig,
  rollbarConfig,
  validateEnvVars,
} from './config';
import { routeTree } from './routeTree.gen';

validateEnvVars();

// @ts-expect-error
const router = createRouter({
  routeTree,
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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

/**
 * Put MinimalismThemeProvider under App component will cause the error:
 * Uncaught TypeError: createTheme_default is not a function
 */

root.render(
  <React.StrictMode>
    <ErrorBoundary config={rollbarConfig} FallbackComponent={ErrorFallback}>
      <Auth.AuthProvider config={auth0Config}>
        <Query.QueryProvider config={queryConfig}>
          <MinimalismThemeProvider>
            <App />
          </MinimalismThemeProvider>
        </Query.QueryProvider>
      </Auth.AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
