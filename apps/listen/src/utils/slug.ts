import { slugify } from 'core/universal/common';

// Playlist slugs must be unique per site but aren't user-facing (routes address
// playlists by id). Reuse core's accent-aware slugify (handles Vietnamese
// titles), append a short random suffix, and fall back when the title has no
// slug-able characters — so duplicate/emoji titles don't collide on the slug
// unique constraint or produce an empty slug.
// Timestamp base guarantees a non-empty, monotonic suffix; the random tail
// avoids collisions within the same millisecond. (Math.random alone can
// collapse to a near-empty base-36 slice.)
const uniqueSuffix = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const createPlaylistSlug = (title: string) =>
  `${slugify(title) || 'playlist'}-${uniqueSuffix()}`;

export { createPlaylistSlug };
