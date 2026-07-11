import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { slugify } from 'core/universal/common';
import { useAuthContext } from 'core/providers/auth';
import {
  useCreatePlaylist,
  useUpdatePlaylist,
  useUpdateVideo,
} from 'core/watch/mutation-hooks';
import { useLoadManage } from 'core/watch/query-hooks';
import { useEffect, useState } from 'react';
import { Notification } from 'ui/universal';
import { LoadingBackdrop } from 'ui/universal';
import { ManageScreen } from 'ui/watch/manage';
import { appConfig } from '../config';
import { clearStandaloneCache } from '../standalone-mode';

const createPlaylistSlug = (title: string) =>
  `${slugify(title) || 'playlist'}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const Content = () => {
  const { user, signOut, getAccessToken } = useAuthContext();
  const navigate = useNavigate();

  const { videos, playlists, isLoading } = useLoadManage();

  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const updateVideo = useUpdateVideo({
    getAccessToken,
  });

  const createPlaylist = useCreatePlaylist({
    getAccessToken,
  });

  const updatePlaylist = useUpdatePlaylist({
    getAccessToken,
  });

  const handleUpdateVideo = (input: {
    id: string;
    title?: string;
    thumbnailUrl?: string;
  }) => {
    updateVideo.mutate(input);
  };

  const handleRepairVideo = (_videoId: string) => {
    setNotification({
      message: 'Repair queued — you will get a notification when ready.',
      severity: 'info',
    });
  };

  const handleCreatePlaylist = (input: {
    title: string;
    slug?: string;
    description?: string;
  }) => {
    createPlaylist.mutate({
      title: input.title,
      slug: input.slug || createPlaylistSlug(input.title),
      description: input.description,
    });
  };

  const handleUpdatePlaylist = (input: {
    id: string;
    title?: string;
    description?: string;
  }) => {
    updatePlaylist.mutate(input);
  };

  if (isLoading) {
    return <LoadingBackdrop message="Loading your library..." />;
  }

  return (
    <>
      <ManageScreen
        sites={appConfig.sites}
        user={user}
        onLogout={() => {
          clearStandaloneCache();
          signOut();
        }}
        onNavigateSettings={() => navigate({ to: '/settings' })}
        isLoading={isLoading}
        videos={videos as any}
        playlists={playlists}
        onUpdateVideo={handleUpdateVideo}
        onRepairVideo={handleRepairVideo}
        onCreatePlaylist={handleCreatePlaylist}
        onUpdatePlaylist={handleUpdatePlaylist}
      />
      {notification && (
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

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
