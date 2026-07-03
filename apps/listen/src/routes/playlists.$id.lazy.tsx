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

// One component for every role: the playlist detail and collection-select
// queries are role-agnostic (Hasura filters by role). Only the "create"
// affordance differs — signed-in users create, anonymous ones are prompted in.
const Content = () => {
  const { id } = Route.useParams();
  const { isSignedIn, user, signIn, signOut } = useAuthContext();
  const queryRs = listenQueryHooks.useLoadPlaylistDetail({ id });
  const { playlists } = listenQueryHooks.useLoadPlaylists();
  const createPlaylist = listenMutationHooks.useCreatePlaylist();
  const onSelectCollection = useCollectionNavigate();

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
      onCreate={
        isSignedIn
          ? (title) =>
              createPlaylist({ title, slug: slugify(title), thumbnailUrl: '' })
          : () => signIn()
      }
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
