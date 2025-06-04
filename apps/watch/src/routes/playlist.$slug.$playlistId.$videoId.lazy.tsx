import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { lazy, useState } from 'react';
import { Auth } from 'core';
import { useLoadPlaylistDetail } from 'core/watch/query-hooks/playlist-detail';
import { useShareVideos, formalize, buildVariables } from 'core/watch/mutation-hooks/share-videos';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';
import { Layout } from '../components/layout';
import React from 'react';
import { AuthRoute } from 'ui/universal/authRoute';

const Notification = lazy(() => import('ui/universal/notification').then(m => ({ default: m.Notification })));

function VideoDetails(): JSX.Element {
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
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
      setNotification({ message: 'Playlist shared successfully', severity: 'success' });
    },
    onError: error => {
      console.error('Failed to share playlist:', error);
      setNotification({ message: 'Failed to share playlist', severity: 'error' });
    },
  });

  const handleShare = (emails: string[]) => {
    if (!videoResult.videos?.length) return;

    try {
      const { playlistId: validPlaylistId, recipients: validRecipients } = formalize(playlistId, emails);

      const variables = buildVariables(validPlaylistId, validRecipients);

      shareVideos(variables);
    } catch (error) {
      console.error('Failed to validate share data:', error);
      setNotification({ message: 'Invalid share data', severity: 'error' });
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
      {notification && <Notification notification={notification} onClose={() => setNotification(null)} />}
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
