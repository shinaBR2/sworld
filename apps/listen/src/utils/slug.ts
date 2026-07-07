import { slugify } from 'core/universal/common';

// Playlist slugs must be unique per site but aren't user-facing (routes address
// playlists by id). Reuse core's accent-aware slugify (handles Vietnamese
// titles), append a short random suffix, and fall back when the title has no
// slug-able characters — so duplicate/emoji titles don't collide on the slug
// unique constraint or produce an empty slug.
const randomSuffix = () => Math.random().toString(36).slice(2, 10);

const createPlaylistSlug = (title: string) =>
  `${slugify(title) || 'playlist'}-${randomSuffix()}`;

export { createPlaylistSlug };
