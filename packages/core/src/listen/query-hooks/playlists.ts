import { graphql } from '../../graphql';
import type { ListenPlaylistsQuery } from '../../graphql/graphql';
import { useRequest } from '../../universal/hooks/use-request';

const playlistsQuery = graphql(/* GraphQL */ `
  query ListenPlaylists {
    playlist(
      where: { site: { _eq: "listen" } }
      order_by: { createdAt: desc }
    ) {
      id
      title
      slug
    }
  }
`);

interface LoadPlaylistsProps {
  getAccessToken: () => Promise<string>;
}

const useLoadPlaylists = (props: LoadPlaylistsProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<ListenPlaylistsQuery>({
    queryKey: ['listen-playlists'],
    getAccessToken,
    document: playlistsQuery,
  });

  return {
    playlists: data ? data.playlist : [],
    isLoading,
    error,
  };
};

// Anonymous variant: no access token, so Hasura runs the query as the `anonymous`
// role, whose permissions already restrict `playlist` to public rows. Reuses the
// same document because the shape is identical — the only difference is the token.
const useLoadPublicPlaylists = () => {
  const { data, isLoading, error } = useRequest<ListenPlaylistsQuery>({
    queryKey: ['listen-public-playlists'],
    document: playlistsQuery,
  });

  return {
    playlists: data ? data.playlist : [],
    isLoading,
    error,
  };
};

export { useLoadPlaylists, useLoadPublicPlaylists };
