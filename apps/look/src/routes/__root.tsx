import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { Auth } from 'core';

export interface RouterContext {
  auth: Auth.AuthContextValue;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return <Outlet />;
  },
});
