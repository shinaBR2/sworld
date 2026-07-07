import { createFileRoute } from '@tanstack/react-router';
import { validateAudioSearch } from './index';

// Same `audio` search param as home — here it rides alongside the playlist id
// in the path: `/playlists/<pid>?audio=<id>` (YouTube's `?v=…&list=…`).
const Route = createFileRoute('/playlists/$id')({
  validateSearch: validateAudioSearch,
});

export { Route };
