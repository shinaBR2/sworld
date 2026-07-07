import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { listenMutationHooks, listenQueryHooks } from 'core';
import { useAuthContext } from 'core/providers/auth';
import { useCallback } from 'react';
import { ListeningScreen } from 'ui/listen/minimalism';
import { LoadingBackdrop } from 'ui/universal';
import { appConfig } from '../config';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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

// One page, one query. `useLoadHome` is role-agnostic — Hasura returns the
// signed-in user's audios/playlists or the public ones for anonymous visitors,
// so the same screen serves both. The only per-role difference is what the
// create action does: create a playlist when signed in, otherwise sign in.
const Content = () => {
  const { user, signIn, signOut } = useAuthContext();
  const { audios, feelings, playlists, isLoading } =
    listenQueryHooks.useLoadHome();
  const createPlaylist = listenMutationHooks.useCreatePlaylist();
  const onSelectCollection = useCollectionNavigate();

  // The playing track is a URL search param (YouTube's `?v=`). Read it in, and
  // update it as the player moves between tracks — pushing a history entry for
  // an explicit pick, replacing for player-driven changes so auto-advance
  // doesn't bury the back button.
  const { audio: activeAudioId = '' } = Route.useSearch();
  const navigate = Route.useNavigate();
  const onAudioChange = useCallback(
    (id: string, replace: boolean) =>
      navigate({ search: (prev) => ({ ...prev, audio: id }), replace }),
    [navigate],
  );

  return (
    <ListeningScreen
      mode="all"
      collectionValue="all"
      sites={appConfig.sites}
      user={user}
      onSignIn={signIn}
      onLogout={signOut}
      playlists={playlists}
      onSelectCollection={onSelectCollection}
      activeAudioId={activeAudioId}
      onAudioChange={onAudioChange}
      onCreate={(title) =>
        user
          ? createPlaylist({ title, slug: slugify(title), thumbnailUrl: '' })
          : signIn()
      }
      feelings={feelings}
      isLoading={isLoading}
      audios={audios}
    />
  );
};

const Home = () => {
  const { isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  return <Content />;
};

export const Route = createLazyFileRoute('/')({
  component: Home,
});
