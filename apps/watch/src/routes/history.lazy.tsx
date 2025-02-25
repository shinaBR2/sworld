import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { LoadingBackdrop } from 'ui/universal';
import { LoginDialog } from 'ui/universal/dialogs';
import { Layout } from '../components/layout';
import { HistoryContainer } from 'ui/watch/history-page/container';
import { useMemo } from 'react';
import React from 'react';
import { useAuthContext } from 'core/providers/auth';
import { useLoadVideos } from 'core/watch/query-hooks/videos';
import { MEDIA_TYPES, TransformedVideo } from 'core/watch/query-hooks';

const Content = () => {
  const { getAccessToken } = useAuthContext();
  const videoResult = useLoadVideos({
    getAccessToken,
  });
  const { isLoading, videos } = videoResult;
  const sortedVideos = useMemo(() => {
    if (!videos) return [];

    return videos
      .filter(video => {
        // TODO
        // Show history for video in playlist also
        if (video.type !== MEDIA_TYPES.VIDEO) {
          return false;
        }

        const { lastWatchedAt, progressSeconds } = video;

        return lastWatchedAt != null && progressSeconds != null && progressSeconds > 0;
      })
      .sort((a, b) => {
        return ((b as TransformedVideo).lastWatchedAt as string).localeCompare(
          (a as TransformedVideo).lastWatchedAt as string
        );
      });
  }, [videos]);

  return (
    <Layout>
      <HistoryContainer isLoading={isLoading} videos={sortedVideos} LinkComponent={Link} />
    </Layout>
  );
};

const History = () => {
  const authContext = useAuthContext();
  const { isSignedIn, isLoading, signIn } = authContext;

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  if (!isSignedIn) {
    return <LoginDialog onAction={signIn} />;
  }

  return <Content />;
};

export const Route = createLazyFileRoute('/history')({
  component: History,
});
