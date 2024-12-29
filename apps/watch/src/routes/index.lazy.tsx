import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { LoadingBackdrop } from 'ui/universal';
import { LoginDialog } from 'ui/universal/dialogs';
import { Auth } from 'core';
import { Home } from '../components/home';

const Index = () => {
  const authContext = Auth.useAuthContext();
  const { isSignedIn, isLoading, signIn } = authContext;

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  if (!isSignedIn) {
    return <LoginDialog onAction={signIn} />;
  }

  return <Home />;
};

export const Route = createLazyFileRoute('/')({
  component: Index,
});
