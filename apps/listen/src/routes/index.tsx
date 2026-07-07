import { createFileRoute } from '@tanstack/react-router';

// The playing track lives in the URL, YouTube-style: the collection is the
// route (home = `/`, the `&list=` equivalent) and the audio is the `audio`
// search param (the `?v=` equivalent). It's optional — absent means "nothing
// selected yet", which keeps a freshly loaded page's URL clean and lets the
// player fall back to the first track.
interface ListenSearch {
  audio?: string;
}

// Shared by both listen routes (home and a playlist) — the `audio` param is
// the same everywhere; only the collection part of the URL differs.
const validateAudioSearch = (search: Record<string, unknown>): ListenSearch =>
  typeof search.audio === 'string' && search.audio
    ? { audio: search.audio }
    : {};

const Route = createFileRoute('/')({
  validateSearch: validateAudioSearch,
});

export { Route, validateAudioSearch };
export type { ListenSearch };
