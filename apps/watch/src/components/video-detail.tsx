import { Auth, watchQueryHooks } from 'core';
import React from 'react';
import { Link } from '@tanstack/react-router';
import { Layout } from './layout';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';

const VideoDetail = () => {
  const authContext = Auth.useAuthContext();
  const { getAccessToken } = authContext;
  const videoResult = watchQueryHooks.useLoadVideos({
    getAccessToken,
  });

  return (
    <Layout>
      <VideoDetailContainer
        queryRs={videoResult}
        asLink={true}
        LinkComponent={Link}
      />
    </Layout>
  );
};

export { VideoDetail };
