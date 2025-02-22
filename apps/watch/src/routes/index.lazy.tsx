import React from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { LoadingBackdrop } from 'ui/universal';
import { LoginDialog } from 'ui/universal/dialogs';
import { Layout } from '../components/layout';
import { HomeContainer } from 'ui/watch/home-page/container';
import { useAuthContext } from 'core/providers/auth';
import { useLoadVideos } from 'core/watch/query-hooks/videos';

const Content = () => {
  const { getAccessToken } = useAuthContext();
  const videoResult = useLoadVideos({
    getAccessToken,
  });

  return (
    <Layout>
      <HomeContainer queryRs={videoResult} LinkComponent={Link} />
    </Layout>
  );
};

const Index = () => {
  const authContext = useAuthContext();
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
