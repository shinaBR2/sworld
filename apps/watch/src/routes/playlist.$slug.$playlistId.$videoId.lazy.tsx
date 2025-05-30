import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Auth } from 'core';
import { useLoadPlaylistDetail } from 'core/watch/query-hooks/playlist-detail';
import { useShareVideos, formalize, buildVariables } from 'core/watch/mutation-hooks/share-videos';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';
import { Layout } from '../components/layout';
import React from 'react';
import { AuthRoute } from 'ui/universal/authRoute';

function VideoDetails(): JSX.Element {
  const { playlistId, videoId } = Route.useParams();
  const navigate = useNavigate();
  const authContext = Auth.useAuthContext();
  const videoResult = useLoadPlaylistDetail({
    getAccessToken: authContext.getAccessToken,
    id: playlistId,
  });

  const { mutate: shareVideos } = useShareVideos({
    getAccessToken: authContext.getAccessToken,
    onSuccess: () => {
      // TODO: Show success toast or notification
    },
    onError: error => {
      console.error('Failed to share videos:', error);
      // TODO: Show error toast or notification
    },
  });

  const handleShare = (emails: string[]) => {
    if (!videoResult.videos?.length) return;

    const videoIds = videoResult.videos.map(video => video.id);
    try {
      const {
        playlistId: validPlaylistId,
        videoIds: validVideoIds,
        recipients: validRecipients,
      } = formalize(playlistId, videoIds, emails);

      const variables = buildVariables(validPlaylistId, validVideoIds, validRecipients);

      shareVideos(variables);
    } catch (error) {
      console.error('Failed to validate share data:', error);
      // TODO: Show error toast or notification
    }
  };

  const handleVideoEnded = (nextVideo: { id: string; slug: string }) => {
    navigate({
      to: '/playlist/$slug/$playlistId/$videoId',
      params: {
        slug: nextVideo.slug,
        playlistId: playlistId,
        videoId: nextVideo.id,
      },
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

export const Route = createLazyFileRoute('/playlist/$slug/$playlistId/$videoId')({
  component: () => {
    return (
      <AuthRoute>
        <VideoDetails />
      </AuthRoute>
    );
  },
});
