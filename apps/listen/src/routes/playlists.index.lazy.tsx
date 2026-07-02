import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { listenMutationHooks, listenQueryHooks } from 'core';
import { useAuthContext } from 'core/providers/auth';
import React from 'react';
import { PlaylistLibrary } from 'ui/listen/minimalism';
import { AuthRoute } from 'ui/universal/authRoute';
import { Layout } from '../components/layout';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const Content = () => {
  const { getAccessToken } = useAuthContext();
  const queryRs = listenQueryHooks.useLoadPlaylists({ getAccessToken });
  const createPlaylist = listenMutationHooks.useCreatePlaylist();

  const handleCreate = (title: string) => {
    createPlaylist({ title, slug: slugify(title), thumbnailUrl: '' });
  };

  return (
    <Layout>
      <PlaylistLibrary
        queryRs={queryRs}
        onCreate={handleCreate}
        LinkComponent={Link}
      />
    </Layout>
  );
};

export const Route = createLazyFileRoute('/playlists/')({
  component: () => (
    <AuthRoute>
      <Content />
    </AuthRoute>
  ),
});
