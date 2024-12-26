import { Auth, Query } from 'core';
import { UniversalUI } from 'ui';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const validateEnvVars = () => {
  const required = [
    'VITE_AUTH0_DOMAIN',
    'VITE_AUTH0_CLIENT_ID',
    'VITE_HASURA_GRAPHQL_URL',
  ];
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

validateEnvVars();

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_HASURA_GRAPHQL_URL,
  redirectUri: window.location.origin,
};
const queryConfig = {
  hasuraUrl: import.meta.env.VITE_HASURA_GRAPHQL_URL,
};

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
