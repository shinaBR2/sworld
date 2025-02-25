import { AppError } from 'core/universal';
import { MEDIA_TYPES } from 'core/watch/query-hooks';
import { useLoadVideos } from 'core/watch/query-hooks/videos';
import { generateVideoDetailRoute, generateVideoInPlaylistRoute } from 'core/watch/routes';

const genlinkProps = (video: ReturnType<typeof useLoadVideos>['videos'][0]) => {
  if (video.type === MEDIA_TYPES.VIDEO) {
    return generateVideoDetailRoute({
      id: video.id,
      slug: video.slug,
    });
  }

  if (video.type === MEDIA_TYPES.PLAYLIST) {
    return generateVideoInPlaylistRoute({
      playlistId: video.id,
      playlistSlug: video.slug,
      videoId: video.firstVideoId,
    });
  }

  throw new AppError('Invalid media type', 'Invalid media type', false);
};

export { genlinkProps };
