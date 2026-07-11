interface ManageVideo {
  __typename?: 'videos';
  id: any;
  title: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  source?: string | null;
  status?: string;
  slug: string;
  createdAt?: any;
}

interface VideoEdit {
  id: string;
  title?: string;
  thumbnailUrl?: string;
}

interface PlaylistVideo {
  __typename?: 'playlist_videos';
  position: number;
  playlist_id: any;
  video_id: any;
  video: {
    __typename?: 'videos';
    id: any;
    title: string;
    duration?: number | null;
  };
}

interface ManagePlaylist {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  playlist_videos: PlaylistVideo[];
}

interface PlaylistCreate {
  title: string;
  slug: string;
  thumbnailUrl?: string;
  description?: string;
}

interface PlaylistEdit {
  id: string;
  title?: string;
  description?: string;
}

interface ReorderPlaylistVariables {
  playlistId: string;
  items: Array<{ videoId: string; position: number }>;
}

export type {
  ManageVideo,
  VideoEdit,
  ManagePlaylist,
  PlaylistVideo,
  PlaylistCreate,
  PlaylistEdit,
  ReorderPlaylistVariables,
};
