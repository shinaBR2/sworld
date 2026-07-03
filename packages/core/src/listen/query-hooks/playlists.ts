import { graphql } from '../../graphql';
import type { ListenPlaylistsQuery } from '../../graphql/graphql';
import { useAuthContext } from '../../providers/auth';
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

// One hook for every role. The query is identical for authenticated and
// anonymous visitors — Hasura's row permissions already restrict `playlist`
// to the rows each role may see. The only difference is the token: attach it
// when signed in, omit it for anonymous so Hasura runs as the `anonymous` role.
const useLoadPlaylists = () => {
  const { isSignedIn, getAccessToken } = useAuthContext();

  const { data, isLoading, error } = useRequest<ListenPlaylistsQuery>({
    queryKey: ['listen-playlists', isSignedIn],
    getAccessToken: isSignedIn ? getAccessToken : undefined,
    document: playlistsQuery,
  });

  return {
    playlists: data ? data.playlist : [],
    isLoading,
    error,
  };
};

export { useLoadPlaylists };
