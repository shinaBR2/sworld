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

export type { ManagePlaylist, PlaylistCreate, PlaylistEdit };
