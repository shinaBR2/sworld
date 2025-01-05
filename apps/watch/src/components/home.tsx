import { Auth, watchQueryHooks } from 'core';
import React from 'react';

import { Link } from '@tanstack/react-router';
import { Layout } from './layout';
import { HomeContainer } from 'ui/watch/home-page/container';

const Home = () => {
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

export { Home };
