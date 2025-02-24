import { useLoadVideos } from '../query-hooks/videos';

const generateVideoDetailRoute = (video: ReturnType<typeof useLoadVideos>['videos'][0]) => {
  return {
    to: '/video/$slug/$id',
    params: {
      slug: video.slug,
      id: video.id,
    },
  };
};

// TODO fix any
const generatePlaylistDetailRoute = (playlist: any) => {
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
