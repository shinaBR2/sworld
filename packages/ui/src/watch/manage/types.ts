interface ManageVideo {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  duration: number | null;
  source: string | null;
  status: string;
  slug: string;
  createdAt: string;
}

interface VideoEdit {
  id: string;
  title?: string;
  thumbnailUrl?: string;
}

interface ManagePlaylist {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
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

export type { ManageVideo, VideoEdit, ManagePlaylist, PlaylistCreate, PlaylistEdit };
