import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { UniversalMinimalismThemeProvider } from 'ui/universal/minimalism';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <UniversalMinimalismThemeProvider>
        <Outlet />
        <TanStackRouterDevtools />
      </UniversalMinimalismThemeProvider>
    </QueryClientProvider>
  ),
});
