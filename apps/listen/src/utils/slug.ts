const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Playlist slugs must be unique per site but aren't user-facing (routes address
// playlists by id), so append a short random suffix — and fall back when the
// title has no slug-able characters (emoji/punctuation-only) — to avoid unique
// constraint violations and empty slugs.
const createPlaylistSlug = (title: string) =>
  `${slugify(title) || 'playlist'}-${crypto.randomUUID().slice(0, 8)}`;

export { slugify, createPlaylistSlug };
