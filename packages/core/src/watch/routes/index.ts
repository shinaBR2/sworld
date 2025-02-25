import { TransformedPlaylist, TransformedVideo } from '../query-hooks/types';

const generateVideoDetailRoute = (video: TransformedVideo) => {
  return {
    to: '/video/$slug/$id',
    params: {
      slug: video.slug,
      id: video.id,
    },
  };
};

// TODO fix any
const generatePlaylistDetailRoute = (playlist: TransformedPlaylist) => {
  return {
    to: '/playlist/$slug/$playlistId/$videoId',
    params: {
      slug: playlist.slug,
      playlistId: playlist.id,
      videoId: playlist.firstVideoId,
    },
  };
};

export { generateVideoDetailRoute, generatePlaylistDetailRoute };
