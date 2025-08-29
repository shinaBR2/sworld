import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Auth } from 'core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { auth0Config } from './config';
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });
// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const validateEnvVars = () => {
  const required = [
    'VITE_AUTH0_DOMAIN',
    'VITE_AUTH0_CLIENT_ID',
    'VITE_HASURA_DOMAIN',
  ];
  const missing = required.filter((key) => !import.meta.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
};

validateEnvVars();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth.AuthProvider config={auth0Config}>
      <RouterProvider router={router} />
    </Auth.AuthProvider>
  </React.StrictMode>,
);
