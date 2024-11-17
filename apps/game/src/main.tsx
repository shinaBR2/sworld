import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { Auth } from 'core';
import { routeTree } from './routeTree.gen';
import { firebaseConfig } from './firebase';

// Create a new router instance
const router = createRouter({ routeTree });
// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth.AuthProvider firebaseConfig={firebaseConfig}>
      <RouterProvider router={router} />
    </Auth.AuthProvider>
  </React.StrictMode>
);
