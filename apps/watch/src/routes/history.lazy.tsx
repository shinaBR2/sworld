import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useAuthContext } from 'core/providers/auth';
import { useLoadHistory } from 'core/watch/query-hooks/history';
import React, { useMemo } from 'react';
import { AuthRoute } from 'ui/universal/authRoute';
import { HistoryContainer } from 'ui/watch/history-page/container';
import { Layout } from '../components/layout';

const Content = () => {
  const { getAccessToken } = useAuthContext();
  const videoResult = useLoadHistory({
    getAccessToken,
  });
  const { isLoading, videos } = videoResult;
  const sortedVideos = useMemo(() => {
    if (!videos) return [];

    return videos.sort((a, b) => {
      return (b.lastWatchedAt as string).localeCompare(
        a.lastWatchedAt as string,
      );
    });
  }, [videos]);

  return (
    <Layout>
      <HistoryContainer
        isLoading={isLoading}
        videos={sortedVideos}
        LinkComponent={Link}
      />
    </Layout>
  );
};

export const Route = createLazyFileRoute('/history')({
  component: () => {
    return (
      <AuthRoute>
        <Content />
      </AuthRoute>
    );
  },
});
