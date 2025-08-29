interface GenerateVideoDetailRouteProps {
  id: string;
  slug: string;
}

const generateVideoDetailRoute = (props: GenerateVideoDetailRouteProps) => {
  const { id, slug } = props;

  return {
    to: '/video/$slug/$id',
    params: {
      slug,
      id,
    },
  };
};

interface GenerateVideoInPlaylistRouteProps {
  videoId: string;
  playlistId: string;
  playlistSlug: string;
}

const generateVideoInPlaylistRoute = (
  props: GenerateVideoInPlaylistRouteProps,
) => {
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

export { generateVideoDetailRoute, generateVideoInPlaylistRoute };
