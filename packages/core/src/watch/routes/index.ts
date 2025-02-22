import { MEDIA_TYPES, TransformedMediaItem } from '../query-hooks/videos';

const generateVideoDetailRoute = (video: TransformedMediaItem) => {
  if (video.type === MEDIA_TYPES.VIDEO) {
    return {
      to: '/video/$slug/$id',
      params: {
        slug: video.slug,
        id: video.id,
      },
    };
  }

  if (video.type === MEDIA_TYPES.PLAYLIST) {
    return {
      to: '/playlist/$slug/$id',
      params: {
        slug: video.slug,
        id: video.id,
      },
    };
  }

  return { to: '', params: {} };
};

export { generateVideoDetailRoute };
