import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useAuthContext } from 'core/providers/auth';
import {
  buildVariables,
  formalize,
  useShareVideo,
} from 'core/watch/mutation-hooks/share-videos';
import { useLoadVideoDetail } from 'core/watch/query-hooks/video-detail';
import React, { lazy, useState } from 'react';
import { AuthRoute } from 'ui/universal/authRoute';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';
import { Layout } from '../components/layout';

const Notification = lazy(() =>
  import('ui/universal/notification').then((m) => ({
    default: m.Notification,
  })),
);

function VideoDetails() {
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const { id: videoId } = Route.useParams();
  const navigate = Route.useNavigate();
  const authContext = useAuthContext();
  const videoResult = useLoadVideoDetail({
    getAccessToken: authContext.getAccessToken,
    id: videoId,
  });

  const { mutate: shareVideo } = useShareVideo({
    getAccessToken: authContext.getAccessToken,
    onSuccess: () => {
      setNotification({
        message: 'Video shared successfully',
        severity: 'success',
      });
    },
    onError: () => {
      setNotification({ message: 'Failed to share video', severity: 'error' });
    },
  });

  const handleShare = (emails: string[]) => {
    try {
      const { entityId, recipients } = formalize(videoId, emails);
      const variables = buildVariables(entityId, recipients);

      shareVideo(variables);
    } catch (error) {
      console.error('Failed to validate share data:', error);
      setNotification({ message: 'Invalid share data', severity: 'error' });
    }
  };

  const handleVideoEnded = (nextVideo: { id: string; slug: string }) => {
    navigate({
      to: '/video/$slug/$id',
      params: {
        slug: nextVideo.slug,
        id: nextVideo.id,
      },
    });
  };

  return (
    <Layout>
      {notification && (
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
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
