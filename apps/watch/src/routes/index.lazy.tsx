import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { UniversalUI } from 'ui';
import { Auth } from 'core';
import { Home } from '../components/home';

const { Dialogs } = UniversalUI;
const { LoginDialog } = Dialogs;

const Index = () => {
  const authContext = Auth.useAuthContext();
  const { isSignedIn, signIn } = authContext;

  if (!isSignedIn) {
    return <LoginDialog onAction={signIn} />;
  }

  return <Home />;
};

export const Route = createLazyFileRoute('/')({
  component: Index,
});
