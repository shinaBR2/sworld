import { Parser } from 'm3u8-parser';

/**
 * If `content` is a **master** playlist (variant streams, no media segments),
 * return the absolute URL of the highest-bandwidth variant. Returns `null` when
 * `content` is already a media playlist (has segments) or has neither — callers
 * then parse it directly (and surface "Empty HLS content" if truly empty). Pure.
 */
const selectVariantUrl = (
  content: string,
  sourceUrl: string,
): string | null => {
  const parser = new Parser();
  parser.push(content);
  parser.end();

  const { playlists, segments } = parser.manifest;

  if (segments && segments.length > 0) {
    return null;
  }

  if (playlists && playlists.length > 0) {
    const best = playlists.reduce((prev, curr) =>
      (curr.attributes?.BANDWIDTH || 0) > (prev.attributes?.BANDWIDTH || 0)
        ? curr
        : prev,
    );
    return new URL(best.uri, sourceUrl).toString();
  }

  return null;
};

export { selectVariantUrl };
