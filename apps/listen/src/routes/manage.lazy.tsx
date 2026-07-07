import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { listenMutationHooks, listenQueryHooks } from 'core';
import { useAuthContext } from 'core/providers/auth';
import { ManageScreen } from 'ui/listen/minimalism';
import { LoadingBackdrop } from 'ui/universal';
import { useEffect } from 'react';
import { appConfig } from '../config';
import { createPlaylistSlug } from '../utils/slug';

const Content = () => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const { audios, feelings, playlists, isLoading } =
    listenQueryHooks.useLoadManage();

  const updateAudio = listenMutationHooks.useUpdateAudio();
  const deleteAudio = listenMutationHooks.useDeleteAudio();
  const assignFeeling = listenMutationHooks.useAssignFeeling();
  const unassignFeeling = listenMutationHooks.useUnassignFeeling();
  const createPlaylist = listenMutationHooks.useCreatePlaylist();
  const updatePlaylist = listenMutationHooks.useUpdatePlaylist();
  const deletePlaylist = listenMutationHooks.useDeletePlaylist();

  return (
    <ManageScreen
      sites={appConfig.sites}
      user={user}
      onLogout={signOut}
      isLoading={isLoading}
      audios={audios}
      feelings={feelings}
      playlists={playlists}
      onUpdateAudio={updateAudio}
      onDeleteAudio={deleteAudio}
      onAssignFeeling={assignFeeling}
      onUnassignFeeling={unassignFeeling}
      onCreatePlaylist={({ title, description }) =>
        createPlaylist({
          title,
          slug: createPlaylistSlug(title),
          thumbnailUrl: '',
          description,
        })
      }
      onUpdatePlaylist={updatePlaylist}
      onDeletePlaylist={deletePlaylist}
      onOpenPlaylist={(id) =>
        navigate({ to: '/playlists/$id', params: { id } })
      }
    />
  );
};

// Management is signed-in only — send anonymous visitors back to the player.
const Manage = () => {
  const { isLoading, user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/' });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  if (!user) {
    return null;
  }

  return <Content />;
};

export const Route = createLazyFileRoute('/manage')({
  component: Manage,
});
