import {
  generateVideoDetailRoute,
  generateVideoInPlaylistRoute,
} from 'core/watch/routes';
import type { ContinueWatchingItem } from './types';

/**
 * Generates link props for a continue-watching item. A video watched inside a
 * playlist links to the in-playlist route so it resumes in context; a
 * standalone video links to the video detail route.
 * @param item - A continue-watching item
 * @returns Link props for either the in-playlist or video detail route
 */
const genlinkProps = (item: ContinueWatchingItem) => {
  const { playlist } = item;

  if (playlist) {
    return generateVideoInPlaylistRoute({
      playlistId: playlist.id,
      playlistSlug: playlist.slug,
      videoId: item.id,
    });
  }

  return generateVideoDetailRoute({
    id: item.id,
    slug: item.slug,
  });
};

export { genlinkProps };
