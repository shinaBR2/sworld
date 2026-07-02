import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { listenMutationHooks, listenQueryHooks } from 'core';
import { useAuthContext } from 'core/providers/auth';
import React from 'react';
import { PlaylistDetail } from 'ui/listen/minimalism';
import { AuthRoute } from 'ui/universal/authRoute';
import { Layout } from '../components/layout';

const Content = () => {
  const { id } = Route.useParams();
  const { getAccessToken } = useAuthContext();
  const queryRs = listenQueryHooks.useLoadPlaylistDetail({
    id,
    getAccessToken,
  });
  const removeAudio = listenMutationHooks.useRemoveAudioFromPlaylist();

  const handleRemove = (audioId: string) => {
    removeAudio({ playlistId: id, audioId });
  };

  return (
    <Layout>
      <PlaylistDetail
        queryRs={queryRs}
        onRemove={handleRemove}
        LinkComponent={Link}
      />
    </Layout>
  );
};

export const Route = createLazyFileRoute('/playlists/$id')({
  component: () => (
    <AuthRoute>
      <Content />
    </AuthRoute>
  ),
});
