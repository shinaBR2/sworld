import { Auth, Query } from 'core';
import { UniversalUI } from 'ui';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { auth0Config, queryConfig, validateEnvVars } from './config';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

validateEnvVars();

root.render(
  <React.StrictMode>
    <UniversalUI.ErrorBoundary>
      <Auth.AuthProvider config={auth0Config}>
        <Query.QueryProvider config={queryConfig}>
          <App />
        </Query.QueryProvider>
      </Auth.AuthProvider>
    </UniversalUI.ErrorBoundary>
  </React.StrictMode>
);
