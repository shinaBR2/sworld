import { graphql } from '../../../graphql';
import { PlaylistsQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { BaseQueryProps } from '../types';

const playlistsQuery = graphql(/* GraphQL */ `
  query Playlists {
    playlist(order_by: { createdAt: desc }) {
      title
      id
      slug
    }
  }
`);

const useLoadPlaylists = (props: BaseQueryProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<PlaylistsQuery>({
    queryKey: ['playlists'],
    getAccessToken,
    document: playlistsQuery,
  });

  return {
    playlists: data ? data.playlist : [],
    isLoading,
    error,
  };
};

export { useLoadPlaylists };
