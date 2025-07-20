import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { routeTree } from './routeTree.gen';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { UniversalMinimalismThemeProvider } from 'ui/universal/minimalism';
import { ErrorFallback } from 'ui/universal/error-boundary';
import { auth0Config, extensionId, queryConfig, rollbarConfig, validateEnvVars } from './config';
import { ErrorBoundary } from 'core/universal/error-boundary';
import { AuthProvider } from 'core/providers/auth';
import { QueryProvider } from 'core/providers/query';
import { PostHogProvider } from 'posthog-js/react';

const postHogApiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const postHogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_UI_HOST,
};

validateEnvVars();

const router = createRouter({
  routeTree,
  defaultViewTransition: true,
  defaultPreload: 'intent',
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  return (
    <UniversalMinimalismThemeProvider>
      <RouterProvider router={router} />
    </UniversalMinimalismThemeProvider>
  );
};

const AppWithPostHog = () => {
  if (!postHogApiKey) {
    return <App />;
  }

  return (
    <PostHogProvider apiKey={postHogApiKey} options={postHogOptions}>
      <App />
    </PostHogProvider>
  );
};

const AppWrapper = () => {
  return (
    <StrictMode>
      <ErrorBoundary config={rollbarConfig} FallbackComponent={ErrorFallback}>
        <AuthProvider config={auth0Config} extensionId={extensionId}>
          <QueryProvider config={queryConfig}>
            <AppWithPostHog />
          </QueryProvider>
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<AppWrapper />);
