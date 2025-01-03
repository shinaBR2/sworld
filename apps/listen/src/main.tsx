import { Auth, Query } from 'core';
import { ErrorBoundary } from 'ui/universal';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import {
  auth0Config,
  appConfig,
  queryConfig,
  systemConfig,
  validateEnvVars,
} from './config';
import LogRocket from 'logrocket';

validateEnvVars();

if (systemConfig.logRocket) {
  LogRocket.init(systemConfig.logRocket, {
    rootHostname: appConfig.sites.main,
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Auth.AuthProvider config={auth0Config}>
        <Query.QueryProvider config={queryConfig}>
          <App />
        </Query.QueryProvider>
      </Auth.AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
