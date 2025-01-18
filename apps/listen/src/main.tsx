import { Auth, initSentry, Query } from 'core';
import { ErrorBoundary } from 'ui/universal';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import {
  auth0Config,
  queryConfig,
  sentryConfig,
  validateEnvVars,
} from './config';

validateEnvVars();
initSentry(sentryConfig);

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
