import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Auth, watchQueryHooks } from 'core';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';
import { Layout } from '../components/layout';
import React from 'react';

function VideoDetails() {
  const { videoId } = Route.useParams();
  const authContext = Auth.useAuthContext();
  const videoResult = watchQueryHooks.useLoadVideoDetail({
    getAccessToken: authContext.getAccessToken,
    id: videoId,
  });

  return (
    <Layout>
      <VideoDetailContainer queryRs={videoResult} LinkComponent={Link} />
    </Layout>
  );
}

export const Route = createLazyFileRoute('/$videoId')({
  component: VideoDetails,
});
