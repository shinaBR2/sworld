import { graphql } from '../../../graphql';
import { AllVideosQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformPlaylistFragment, transformVideoFragment } from '../transformers';

const videosQuery = graphql(/* GraphQL */ `
  query AllVideos @cached {
    videos(
      where: { _and: { _not: { playlist_videos: {} }, source: { _is_null: false } } }
      order_by: { createdAt: desc }
    ) {
      ...VideoFields
    }
    playlist(where: { playlist_videos: {} }) {
      ...PlaylistFields
    }
  }
`);

interface LoadVideosProps {
  getAccessToken: () => Promise<string>;
}

const transform = (data: AllVideosQuery) => {
  const { videos, playlist } = data;
  const standaloneVideos = videos?.map(transformVideoFragment) || [];
  const playlistVideos = playlist?.map(transformPlaylistFragment) || [];
  const merged = [...standaloneVideos, ...playlistVideos];
  const sorted = merged.sort((a, b) => {
    return (b.createdAt as string).localeCompare(a.createdAt as string);
  });

  return sorted;
};

const useLoadVideos = (props: LoadVideosProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<AllVideosQuery>({
    queryKey: ['videos'],
    getAccessToken,
    document: videosQuery,
  });

  return {
    videos: data ? transform(data) : [],
    isLoading,
    error,
  };
};

export { useLoadVideos };
