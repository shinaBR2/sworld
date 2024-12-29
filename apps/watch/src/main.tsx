import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { routeTree } from './routeTree.gen';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Auth, Query } from 'core';
import { UniversalMinimalismThemeProvider } from 'ui/universal/minimalism';
import { auth0Config, queryConfig, validateEnvVars } from './config';

const router = createRouter({
  routeTree,
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

validateEnvVars();

const App = () => {
  const auth = Auth.useAuthContext();

  return <RouterProvider router={router} context={{ auth }} />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth.AuthProvider config={auth0Config}>
      <Query.QueryProvider config={queryConfig}>
        <UniversalMinimalismThemeProvider>
          <App />
        </UniversalMinimalismThemeProvider>
      </Query.QueryProvider>
    </Auth.AuthProvider>
  </StrictMode>
);
