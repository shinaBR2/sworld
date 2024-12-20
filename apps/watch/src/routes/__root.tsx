import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import React from 'react';
import { Auth } from 'core';

export interface RouterContext {
  auth: Auth.AuthContextValue;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return <Outlet />;
  },
});
