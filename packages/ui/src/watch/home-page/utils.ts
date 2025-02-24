import { AppError } from 'core/universal';
import {
  MEDIA_TYPES,
  TransformedMediaItem,
  TransformedPlaylist,
  TransformedVideo,
} from 'core/watch/query-hooks/videos';
import { generatePlaylistDetailRoute, generateVideoDetailRoute } from 'core/watch/routes';

const genlinkProps = (video: TransformedMediaItem) => {
  if (video.type === MEDIA_TYPES.VIDEO) {
    return generateVideoDetailRoute(video as TransformedVideo);
  }

  if (video.type === MEDIA_TYPES.PLAYLIST) {
    return generatePlaylistDetailRoute(video as TransformedPlaylist);
  }

  throw new AppError('Invalid media type', 'Invalid media type', false);
};

export { genlinkProps };
