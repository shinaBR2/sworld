import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { LoadingBackdrop } from 'ui/universal';
import { LoginDialog } from 'ui/universal/dialogs';
import { Auth, watchQueryHooks } from 'core';
import { Layout } from '../components/layout';
import { HistoryContainer } from 'ui/watch/history-page/container';
import { useMemo } from 'react';
import React from 'react';

const Content = () => {
  const { getAccessToken } = Auth.useAuthContext();
  const videoResult = watchQueryHooks.useLoadVideos({
    getAccessToken,
  });
  const { isLoading, videos } = videoResult;
  const sortedVideos = useMemo(() => {
    if (!videos) return [];

    return videos
      .filter(video => {
        return Boolean(video.lastWatchedAt && video.progressSeconds);
      })
      .sort((a, b) => {
        const dateA = new Date(a.lastWatchedAt as string).getTime();
        const dateB = new Date(b.lastWatchedAt as string).getTime();
        return dateB - dateA;
      });
  }, [videos]);

  return (
    <Layout>
      <HistoryContainer isLoading={isLoading} videos={sortedVideos} LinkComponent={Link} />
    </Layout>
  );
};

const History = () => {
  const authContext = Auth.useAuthContext();
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
