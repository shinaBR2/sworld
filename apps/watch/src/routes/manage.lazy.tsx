import { useQueryClient } from '@tanstack/react-query';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuthContext } from 'core/providers/auth';
import { useDeletePlaylist } from 'core/watch/mutation-hooks';
import { useDeleteVideo } from 'core/watch/mutation-hooks';
import { useLoadManageVideos } from 'core/watch/query-hooks/manage-videos';
import { useEffect, useState } from 'react';
import { LoadingBackdrop } from 'ui/universal';
import { ManageScreen } from 'ui/watch/manage';
import { appConfig } from '../config';
import { clearStandaloneCache } from '../standalone-mode';

const Content = () => {
  const { user, signOut, getAccessToken } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { videos, playlists, isLoading } = useLoadManageVideos({
    getAccessToken,
    userId: user?.id ?? '',
  });

  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [deletingPlaylistId, setDeletingPlaylistId] = useState<string | null>(
    null,
  );

  const deleteVideo = useDeleteVideo({
    getAccessToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-videos'] });
      setDeletingVideoId(null);
    },
    onError: () => {
      setDeletingVideoId(null);
    },
  });

  const deletePlaylist = useDeletePlaylist({
    getAccessToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-videos'] });
      setDeletingPlaylistId(null);
    },
    onError: () => {
      setDeletingPlaylistId(null);
    },
  });

  const handleDeleteVideo = (id: string) => {
    setDeletingVideoId(id);
    deleteVideo.mutate({ id });
  };

  const handleDeletePlaylist = (id: string) => {
    setDeletingPlaylistId(id);
    deletePlaylist.mutate({ id });
  };

  const derivedVideos = videos.map((v) => {
    const playlistName = v.playlist_videos?.[0]?.playlist?.title;
    return {
      id: String(v.id),
      title: v.title,
      source: v.source,
      slug: v.slug,
      playlistName,
    };
  });

  const derivedPlaylists = playlists.map((p) => ({
    id: String(p.id),
    title: p.title,
    slug: p.slug,
  }));

  if (isLoading) {
    return <LoadingBackdrop message="Loading your library..." />;
  }

  return (
    <ManageScreen
      sites={appConfig.sites}
      user={user}
      onLogout={() => {
        clearStandaloneCache();
        signOut();
      }}
      onNavigateSettings={() => navigate({ to: '/settings' })}
      videos={derivedVideos}
      playlists={derivedPlaylists}
      onDeleteVideo={handleDeleteVideo}
      onDeletePlaylist={handleDeletePlaylist}
      deletingVideoId={deletingVideoId}
      deletingPlaylistId={deletingPlaylistId}
    />
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
