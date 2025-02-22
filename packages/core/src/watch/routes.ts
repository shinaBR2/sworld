import { MEDIA_TYPES, TransformedMediaItem } from './query-hooks';

const generateVideoDetailRoute = (video: TransformedMediaItem) => {
  if (video.type === MEDIA_TYPES.VIDEO) {
    return '/$videoId';
  }

  if (video.type === MEDIA_TYPES.PLAYLIST) {
    return '/$playlistId';
  }

  return '';
};

export { generateVideoDetailRoute };
