import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useAuthContext } from 'core/providers/auth';
import { useLoadVideos } from 'core/watch/query-hooks/videos';
import React from 'react';
import { AuthRoute } from 'ui/universal/authRoute';
import { HomeContainer } from 'ui/watch/home-page/container';
import { Layout } from '../components/layout';

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

export const Route = createLazyFileRoute('/')({
  component: () => {
    return (
      <AuthRoute>
        <Content />
      </AuthRoute>
    );
  },
});
