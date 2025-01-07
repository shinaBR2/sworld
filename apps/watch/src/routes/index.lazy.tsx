import React from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { LoadingBackdrop } from 'ui/universal';
import { LoginDialog } from 'ui/universal/dialogs';
import { Auth, watchQueryHooks } from 'core';
import { Layout } from '../components/layout';
import { HomeContainer } from 'ui/watch/home-page/container';

const Content = () => {
  const { getAccessToken } = Auth.useAuthContext();
  const videoResult = watchQueryHooks.useLoadVideos({
    getAccessToken,
  });

  return (
    <Layout>
      <HomeContainer queryRs={videoResult} LinkComponent={Link} />
    </Layout>
  );
};

const Index = () => {
  const authContext = Auth.useAuthContext();
  const { isSignedIn, isLoading, signIn } = authContext;

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  if (!isSignedIn) {
    return <LoginDialog onAction={signIn} />;
  }

  return <Content />;
};

export const Route = createLazyFileRoute('/')({
  component: Index,
});
