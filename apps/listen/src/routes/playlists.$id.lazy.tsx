import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { listenMutationHooks, listenQueryHooks } from 'core';
import { useAuthContext } from 'core/providers/auth';
import { ListeningScreen } from 'ui/listen/minimalism';
import { AuthRoute } from 'ui/universal/authRoute';
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

const Content = () => {
  const { id } = Route.useParams();
  const { getAccessToken, user, signIn, signOut } = useAuthContext();
  const queryRs = listenQueryHooks.useLoadPlaylistDetail({
    id,
    getAccessToken,
  });
  const { playlists } = listenQueryHooks.useLoadPlaylists({ getAccessToken });
  const createPlaylist = listenMutationHooks.useCreatePlaylist();
  const removeAudio = listenMutationHooks.useRemoveAudioFromPlaylist();
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
      onCreate={(title) =>
        createPlaylist({ title, slug: slugify(title), thumbnailUrl: '' })
      }
      isLoading={queryRs.isLoading}
      audios={queryRs.audios}
      onRemove={(audioId) => removeAudio({ playlistId: id, audioId })}
    />
  );
};

export const Route = createLazyFileRoute('/playlists/$id')({
  component: () => (
    <AuthRoute>
      <Content />
    </AuthRoute>
  ),
});
