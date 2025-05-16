import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';
import { Layout } from '../components/layout';
import React from 'react';
import { useLoadVideoDetail } from 'core/watch/query-hooks/video-detail';
import { useAuthContext } from 'core/providers/auth';
import { AuthRoute } from 'ui/universal/authRoute';

function VideoDetails() {
  const { id: videoId } = Route.useParams();
  const authContext = useAuthContext();
  const videoResult = useLoadVideoDetail({
    getAccessToken: authContext.getAccessToken,
    id: videoId,
  });

  return (
    <Layout>
      <VideoDetailContainer queryRs={videoResult} activeVideoId={videoId} LinkComponent={Link} />
    </Layout>
  );
}

export const Route = createLazyFileRoute('/video/$slug/$id')({
  component: () => {
    return (
      <AuthRoute>
        <VideoDetails />
      </AuthRoute>
    );
  },
});
