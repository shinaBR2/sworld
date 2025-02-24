import { AppError } from 'core/universal';
import { MEDIA_TYPES, useLoadVideos } from 'core/watch/query-hooks';
import { generatePlaylistDetailRoute, generateVideoDetailRoute } from 'core/watch/routes';

const genlinkProps = (video: ReturnType<typeof useLoadVideos>['videos'][0]) => {
  if (video.type === MEDIA_TYPES.VIDEO) {
    return generateVideoDetailRoute(video);
  }

  if (video.type === MEDIA_TYPES.PLAYLIST) {
    return generatePlaylistDetailRoute(video);
  }

  throw new AppError('Invalid media type', 'Invalid media type', false);
};

export { genlinkProps };
