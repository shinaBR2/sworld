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

interface GenerateVideoInPlaylistRouteProps {
  videoId: string;
  playlistId: string;
  playlistSlug: string;
}

const generateVideoInPlaylistRoute = (props: GenerateVideoInPlaylistRouteProps) => {
  const { videoId, playlistId, playlistSlug } = props;

  return {
    to: '/playlist/$slug/$playlistId/$videoId',
    params: {
      slug: playlistSlug,
      playlistId,
      videoId,
    },
  };
};

export { generateVideoDetailRoute, generatePlaylistDetailRoute, generateVideoInPlaylistRoute };
