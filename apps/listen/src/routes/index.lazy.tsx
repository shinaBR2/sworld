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

const AuthenticatedContent = () => {
  const { getAccessToken, user, signIn, signOut } = useAuthContext();
  const queryRs = listenQueryHooks.useLoadAudios({ getAccessToken });
  const { playlists } = listenQueryHooks.useLoadPlaylists({ getAccessToken });
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
        createPlaylist({ title, slug: slugify(title), thumbnailUrl: '' })
      }
      queryRs={queryRs}
      audios={queryRs.data?.audios ?? []}
    />
  );
};

const AnonymousContent = () => {
  const { user, signIn, signOut } = useAuthContext();
  const queryRs = listenQueryHooks.useLoadPublicAudios();
  const onSelectCollection = useCollectionNavigate();

  return (
    <ListeningScreen
      mode="all"
      collectionValue="all"
      sites={appConfig.sites}
      user={user}
      onSignIn={signIn}
      onLogout={signOut}
      playlists={[]}
      onSelectCollection={onSelectCollection}
      onCreate={() => signIn()}
      queryRs={queryRs}
      audios={queryRs.data?.audios ?? []}
    />
  );
};

const Home = () => {
  const { isSignedIn, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  return isSignedIn ? <AuthenticatedContent /> : <AnonymousContent />;
};

export const Route = createLazyFileRoute('/')({
  component: Home,
});
