// Shapes the management dashboard consumes. The frontend query-hook transformer
// (useLoadManage) already produces these; the mutation hooks accept the *Edit /
// *Ref inputs.

interface ManageAudio {
  id: string;
  name: string;
  artistName: string;
  thumbnailUrl: string;
  source: string;
  tagIds: string[];
}

interface ManageFeeling {
  id: string;
  name: string;
}

interface ManagePlaylist {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
}

interface AudioEdit {
  id: string;
  name?: string;
  artistName?: string;
  thumbnailUrl?: string;
}

interface FeelingRef {
  audioId: string;
  tagId: string;
}

interface PlaylistCreate {
  title: string;
  description?: string;
}

interface PlaylistEdit {
  id: string;
  title?: string;
  description?: string;
}

export type {
  AudioEdit,
  FeelingRef,
  ManageAudio,
  ManageFeeling,
  ManagePlaylist,
  PlaylistCreate,
  PlaylistEdit,
};
