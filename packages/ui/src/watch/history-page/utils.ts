import { generateVideoDetailRoute, generateVideoInPlaylistRoute } from 'core/watch/routes';
import { HistoryVideo } from './types';

/**
 * Generates link props based on the media type (video or playlist).
 * @param video - The video object from useLoadVideos hook
 * @returns Link props for either video detail or playlist route
 * @throws {AppError} If the media type is invalid
 */
const genlinkProps = (video: HistoryVideo) => {
  const { playlist } = video;

  if (playlist) {
    return generateVideoInPlaylistRoute({
      playlistId: playlist.id,
      playlistSlug: playlist.slug,
      videoId: video.id,
    });
  }

  return generateVideoDetailRoute({
    id: video.id,
    slug: video.slug,
  });
};

export { genlinkProps };
