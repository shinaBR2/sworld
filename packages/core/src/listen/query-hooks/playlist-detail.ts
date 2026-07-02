import { getFragmentData, graphql } from '../../graphql';
import type { ListenPlaylistDetailQuery } from '../../graphql/graphql';
import { useRequest } from '../../universal/hooks/use-request';
import { PlaylistAudioFragment, PlaylistFragment } from './fragments';
import { transformAudioFragment } from './transformers';

const playlistDetailQuery = graphql(/* GraphQL */ `
  query ListenPlaylistDetail($id: uuid!) {
    playlist_by_pk(id: $id) {
      ...ListenPlaylistFields
    }
  }
`);

interface LoadPlaylistDetailProps {
  id: string;
  getAccessToken: () => Promise<string>;
}

const transform = (data: ListenPlaylistDetailQuery) => {
  const playlist = getFragmentData(PlaylistFragment, data.playlist_by_pk);
  const audios =
    getFragmentData(PlaylistAudioFragment, playlist?.playlist_audios)
      ?.slice()
      .sort((a, b) => a.position - b.position)
      .map(({ audio }) => transformAudioFragment(audio)) || [];

  return {
    audios,
    playlist,
  };
};

const useLoadPlaylistDetail = (props: LoadPlaylistDetailProps) => {
  const { id, getAccessToken } = props;

  const { data, isLoading, error } = useRequest<
    ListenPlaylistDetailQuery,
    { id: string }
  >({
    queryKey: ['listen-playlist-detail', id],
    getAccessToken,
    document: playlistDetailQuery,
    variables: {
      id,
    },
  });

  const transformed = data
    ? transform(data)
    : {
        audios: [],
        playlist: null,
      };

  return {
    ...transformed,
    isLoading,
    error,
  };
};

export { useLoadPlaylistDetail };
