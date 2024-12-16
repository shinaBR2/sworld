import { Auth, Query } from 'core';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

// console.log(`env vars`, import.meta.env.);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

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
    <Auth.AuthProvider config={auth0Config}>
      <Query.QueryProvider config={queryConfig}>
        <App />
      </Query.QueryProvider>
    </Auth.AuthProvider>
  </React.StrictMode>
);
