import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { Auth } from 'core';
import React from 'react';

export interface RouterContext {
  auth: Auth.AuthContextValue;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return <Outlet />;
  },
});
