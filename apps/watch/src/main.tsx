import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { routeTree } from './routeTree.gen';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Auth, Query } from 'core';
import { UniversalMinimalismThemeProvider } from 'ui/universal/minimalism';
import {
  auth0Config,
  appConfig,
  queryConfig,
  systemConfig,
  validateEnvVars,
} from './config';

validateEnvVars();

const initLogRocket = async () => {
  const LogRocket = (await import('logrocket')).default;

  LogRocket.init(systemConfig.logRocket, {
    rootHostname: appConfig.sites.main,
  });
};

if (systemConfig.logRocket) {
  initLogRocket();
}

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
  return (
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
};

createRoot(document.getElementById('root')!).render(<AppWrapper />);
