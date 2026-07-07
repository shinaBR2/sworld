import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { listenMutationHooks, listenQueryHooks } from 'core';
import { useAuthContext } from 'core/providers/auth';
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
  const navigate = useNavigate();
  const { audios, feelings, playlists, isLoading } =
    listenQueryHooks.useLoadHome();
  const createPlaylist = listenMutationHooks.useCreatePlaylist();
  const onSelectCollection = useCollectionNavigate();

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
      onCreate={(title) =>
        user
          ? createPlaylist({ title, slug: slugify(title), thumbnailUrl: '' })
          : signIn()
      }
      feelings={feelings}
      isLoading={isLoading}
      audios={audios}
      onManage={user ? () => navigate({ to: '/manage' }) : undefined}
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
