import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { LoadingBackdrop } from 'ui/universal';
import { LoginDialog } from 'ui/universal/dialogs';
import { Layout } from '../components/layout';
import { HistoryContainer } from 'ui/watch/history-page/container';
import { useMemo } from 'react';
import React from 'react';
import { useAuthContext } from 'core/providers/auth';
import { useLoadHistory } from 'core/watch/query-hooks/history';

const Content = () => {
  const { getAccessToken } = useAuthContext();
  const videoResult = useLoadHistory({
    getAccessToken,
  });
  const { isLoading, videos } = videoResult;
  console.log(`videos`, videos);
  const sortedVideos = useMemo(() => {
    if (!videos) return [];

    return videos.sort((a, b) => {
      return (b.lastWatchedAt as string).localeCompare(a.lastWatchedAt as string);
    });
  }, [videos]);

  return (
    <Layout>
      <HistoryContainer isLoading={isLoading} videos={sortedVideos} LinkComponent={Link} />
    </Layout>
  );
};

const History = () => {
  const { isSignedIn, isLoading, signIn } = useAuthContext();

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
