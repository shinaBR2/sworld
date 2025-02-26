import { generateVideoDetailRoute, generateVideoInPlaylistRoute } from 'core/watch/routes';
import { useLoadHistory } from 'core/watch/query-hooks/history';

/**
 * Generates link props based on the media type (video or playlist).
 * @param video - The video object from useLoadVideos hook
 * @returns Link props for either video detail or playlist route
 * @throws {AppError} If the media type is invalid
 */
const genlinkProps = (video: ReturnType<typeof useLoadHistory>['videos'][0]) => {
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
