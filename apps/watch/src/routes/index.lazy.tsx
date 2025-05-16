import React from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Layout } from '../components/layout';
import { HomeContainer } from 'ui/watch/home-page/container';
import { useAuthContext } from 'core/providers/auth';
import { useLoadVideos } from 'core/watch/query-hooks/videos';
import { AuthRoute } from 'ui/universal/authRoute';

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
