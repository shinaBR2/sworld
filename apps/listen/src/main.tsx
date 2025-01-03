import { Auth, Query } from 'core';
import { ErrorBoundary } from 'ui/universal';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { auth0Config, queryConfig, validateEnvVars } from './config';
import LogRocket from 'logrocket';

validateEnvVars();

LogRocket.init(systemConfig.logRocket);

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
