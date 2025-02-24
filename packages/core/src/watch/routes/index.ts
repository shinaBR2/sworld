import { TransformedPlaylist, TransformedVideo } from '../query-hooks/videos';

const generateVideoDetailRoute = (video: TransformedVideo) => {
  return {
    to: '/video/$slug/$id',
    params: {
      slug: video.slug,
      id: video.id,
    },
  };
};

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
