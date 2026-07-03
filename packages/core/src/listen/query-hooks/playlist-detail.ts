import { getFragmentData, graphql } from '../../graphql';
import type { ListenPlaylistDetailQuery } from '../../graphql/graphql';
import { useAuthContext } from '../../providers/auth';
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

// One hook for every role. The playlist detail query is identical for
// authenticated and anonymous visitors — Hasura's row permissions restrict
// `playlist_by_pk` / its audios to what each role may see. Attach the token
// when signed in, omit it for anonymous so Hasura runs as the `anonymous` role.
const useLoadPlaylistDetail = (props: LoadPlaylistDetailProps) => {
  const { id } = props;
  const { isSignedIn, getAccessToken } = useAuthContext();

  const { data, isLoading, error } = useRequest<
    ListenPlaylistDetailQuery,
    { id: string }
  >({
    queryKey: ['listen-playlist-detail', isSignedIn, id],
    getAccessToken: isSignedIn ? getAccessToken : undefined,
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
