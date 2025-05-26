import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Auth } from 'core';
import { useLoadPlaylistDetail } from 'core/watch/query-hooks/playlist-detail';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';
import { Layout } from '../components/layout';
import React from 'react';
import { AuthRoute } from 'ui/universal/authRoute';

function VideoDetails() {
  const { playlistId, videoId } = Route.useParams();
  const navigate = Route.useNavigate();
  const authContext = Auth.useAuthContext();
  const videoResult = useLoadPlaylistDetail({
    getAccessToken: authContext.getAccessToken,
    id: playlistId,
  });

  const handleVideoEnded = (nextVideo: { id: string; slug: string }) => {
    navigate({
      to: '/playlist/$slug/$playlistId/$videoId',
      params: {
        slug: nextVideo.slug,
        playlistId: playlistId,
        videoId: nextVideo.id
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
      />
    </Layout>
  );
}

export const Route = createLazyFileRoute('/playlist/$slug/$playlistId/$videoId')({
  component: () => {
    return (
      <AuthRoute>
        <VideoDetails />
      </AuthRoute>
    );
  },
});
