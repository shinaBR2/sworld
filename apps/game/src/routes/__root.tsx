import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { UniversalUI } from 'ui';

const queryClient = new QueryClient();
const { UniversalMinimalismThemeProvider } = UniversalUI.Minimalism;

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
