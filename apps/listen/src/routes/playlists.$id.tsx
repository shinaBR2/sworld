import { createFileRoute } from '@tanstack/react-router';
import type { ListenSearch } from './index';

// Same `audio` search param as home — here it rides alongside the playlist id
// in the path: `/playlists/<pid>?audio=<id>` (YouTube's `?v=…&list=…`).
const validateSearch = (search: Record<string, unknown>): ListenSearch =>
  typeof search.audio === 'string' && search.audio
    ? { audio: search.audio }
    : {};

const Route = createFileRoute('/playlists/$id')({
  validateSearch,
});

export { Route };
