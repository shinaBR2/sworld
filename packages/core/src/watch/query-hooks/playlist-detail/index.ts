import { getFragmentData, graphql } from '../../../graphql';
import type { PlaylistDetailQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { PlaylistFragment, PlaylistVideoFragment } from '../fragments';
import { transformVideoFragment } from '../transformers';

const playlistDetailQuery = graphql(/* GraphQL */ `
  query PlaylistDetail($id: uuid!) {
    playlist_by_pk(id: $id) {
      ...PlaylistFields
    }
  }
`);

interface LoadPlaylistDetailProps {
  id: string;
  getAccessToken: () => Promise<string>;
}

const transform = (data: PlaylistDetailQuery) => {
  const playlist = getFragmentData(PlaylistFragment, data.playlist_by_pk);
  const videos =
    getFragmentData(PlaylistVideoFragment, playlist?.playlist_videos)
      ?.sort((a, b) => a.position - b.position)
      .map(({ video }) => transformVideoFragment(video)) || [];

  return {
    videos,
    playlist,
  };
};

const useLoadPlaylistDetail = (props: LoadPlaylistDetailProps) => {
  const { id, getAccessToken } = props;

  const { data, isLoading, error } = useRequest<
    PlaylistDetailQuery,
    { id: string }
  >({
    queryKey: ['playlist-detail', id],
    getAccessToken,
    document: playlistDetailQuery,
    variables: {
      id,
    },
  });

  const transformed = data
    ? transform(data)
    : {
        videos: [],
        playlist: null,
      };

  return {
    ...transformed,
    isLoading,
    error,
  };
};

export { useLoadPlaylistDetail };
