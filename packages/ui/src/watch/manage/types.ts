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

export type { ManageVideo, VideoEdit };
