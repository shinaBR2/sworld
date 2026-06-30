import type { MediaType } from 'core/watch/query-hooks';

// The continue-watching row declares its OWN item contract — the fields the
// card + link need — rather than importing a type derived from a data hook.
// Any source that produces this shape (e.g. useLoadVideos' continueWatching)
// satisfies it structurally, with no cross-hook coupling.
interface ContinueWatchingItem {
  id: string;
  type: MediaType;
  title: string;
  thumbnailUrl: string;
  source: string;
  slug: string;
  duration: number;
  createdAt: string;
  user: {
    username: string;
  };
  progressSeconds: number;
  lastWatchedAt: string | null;
  playlist?: {
    id: string;
    slug: string;
    title: string;
  };
}

export type { ContinueWatchingItem };
