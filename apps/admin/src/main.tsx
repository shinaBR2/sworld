import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { Auth } from 'core';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_HASURA_GRAPHQL_URL,
  redirectUri: window.location.origin,
};

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Auth.AuthProvider config={auth0Config}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth.AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
