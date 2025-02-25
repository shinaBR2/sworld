import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Auth } from 'core';
import { useLoadPlaylistDetail } from 'core/watch/query-hooks/playlist-detail';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';
import { Layout } from '../components/layout';
import React from 'react';

function VideoDetails() {
  const { playlistId, videoId } = Route.useParams();
  const authContext = Auth.useAuthContext();
  const videoResult = useLoadPlaylistDetail({
    getAccessToken: authContext.getAccessToken,
    id: playlistId,
  });

  return (
    <Layout>
      <VideoDetailContainer queryRs={videoResult} activeVideoId={videoId} LinkComponent={Link} />
    </Layout>
  );
}

export const Route = createLazyFileRoute('/playlist/$slug/$playlistId/$videoId')({
  component: VideoDetails,
});
