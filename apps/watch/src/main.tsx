import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { routeTree } from './routeTree.gen';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Auth, Query } from 'core';
import { UniversalUI } from 'ui';

const ThemeProvider = UniversalUI.Minimalism.UniversalMinimalismThemeProvider;
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

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_HASURA_GRAPHQL_URL,
  redirectUri: window.location.origin,
};
const queryConfig = {
  hasuraUrl: import.meta.env.VITE_HASURA_GRAPHQL_URL,
};

const App = () => {
  const auth = Auth.useAuthContext();

  return <RouterProvider router={router} context={{ auth }} />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth.AuthProvider config={auth0Config}>
      <Query.QueryProvider config={queryConfig}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Query.QueryProvider>
    </Auth.AuthProvider>
  </StrictMode>
);
