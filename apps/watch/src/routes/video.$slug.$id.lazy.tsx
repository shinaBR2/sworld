import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';
import { Layout } from '../components/layout';
import React from 'react';
import { useLoadVideoDetail } from 'core/watch/query-hooks/video-detail';
import { useAuthContext } from 'core/providers/auth';
import { AuthRoute } from 'ui/universal/authRoute';

function VideoDetails() {
  const { id: videoId } = Route.useParams();
  const navigate = Route.useNavigate();
  const authContext = useAuthContext();
  const videoResult = useLoadVideoDetail({
    getAccessToken: authContext.getAccessToken,
    id: videoId,
  });

  const handleShare = (emails: string[]) => {
    // TODO: Implement share mutation
    console.log('Sharing with emails:', emails);
  };

  const handleVideoEnded = (nextVideo: { id: string; slug: string }) => {
    navigate({
      to: '/video/$slug/$id',
      params: {
        slug: nextVideo.slug,
        id: nextVideo.id
      }
    });
  };

  return (
    <Layout>
      <VideoDetailContainer 
        queryRs={videoResult} 
        activeVideoId={videoId} 
        LinkComponent={Link}
        onVideoEnded={handleVideoEnded}
        onShare={handleShare}
      />
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
