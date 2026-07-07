import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { listenMutationHooks, listenQueryHooks } from 'core';
import { useAuthContext } from 'core/providers/auth';
import { useCallback } from 'react';
import { ListeningScreen } from 'ui/listen/minimalism';
import { LoadingBackdrop } from 'ui/universal';
import { appConfig } from '../config';
import { createPlaylistSlug } from '../utils/slug';

// Selecting a collection is navigation, not state: All → `/`, a playlist → its URL.
const useCollectionNavigate = () => {
  const navigate = useNavigate();

  return (value: 'all' | string) => {
    if (value === 'all') {
      navigate({ to: '/' });
    } else {
      navigate({ to: '/playlists/$id', params: { id: value } });
    }
  };
};

// One component for every role: the playlist detail and collection-select
// queries are role-agnostic (Hasura filters by role). Only the "create"
// affordance differs — signed-in users create, anonymous ones are prompted in.
const Content = () => {
  const { id } = Route.useParams();
  const { isSignedIn, user, signIn, signOut } = useAuthContext();
  const navigate = useNavigate();
  const queryRs = listenQueryHooks.useLoadPlaylistDetail({ id });
  const { playlists } = listenQueryHooks.useLoadPlaylists();
  const createPlaylist = listenMutationHooks.useCreatePlaylist();
  const onSelectCollection = useCollectionNavigate();

  // Same `audio` search param as home, alongside the playlist id in the path.
  const { audio: activeAudioId = '' } = Route.useSearch();
  const searchNavigate = Route.useNavigate();
  const onAudioChange = useCallback(
    (id: string) =>
      searchNavigate({
        search: (prev) => ({ ...prev, audio: id }),
        replace: true,
      }),
    [searchNavigate],
  );

  return (
    <ListeningScreen
      mode="playlist"
      collectionValue={id}
      sites={appConfig.sites}
      user={user}
      onSignIn={signIn}
      onLogout={signOut}
      playlists={playlists}
      onSelectCollection={onSelectCollection}
      activeAudioId={activeAudioId}
      onAudioChange={onAudioChange}
      onCreate={
        isSignedIn
          ? (title) =>
              createPlaylist({
                title,
                slug: createPlaylistSlug(title),
                thumbnailUrl: '',
              })
          : () => signIn()
      }
      onManage={user ? () => navigate({ to: '/manage' }) : undefined}
      isLoading={queryRs.isLoading}
      audios={queryRs.audios}
    />
  );
};

const PlaylistDetail = () => {
  const { isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  return <Content />;
};

export const Route = createLazyFileRoute('/playlists/$id')({
  component: PlaylistDetail,
});
