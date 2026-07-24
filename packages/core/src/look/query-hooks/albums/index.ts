import { graphql } from '../../../graphql';
import type {
  LookAlbumDetailQuery,
  LookAlbumsQuery,
} from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformAlbumFragment } from '../transformers';
import type { BaseQueryProps, DetailQueryProps } from '../types';

const albumsQuery = graphql(/* GraphQL */ `
  query LookAlbums @cached {
    playlist(
      where: { site: { _eq: "look" } }
      order_by: { createdAt: desc }
    ) {
      ...AlbumFields
    }
  }
`);

const albumDetailQuery = graphql(/* GraphQL */ `
  query LookAlbumDetail($id: uuid!) @cached {
    playlist_by_pk(id: $id) {
      ...AlbumFields
    }
  }
`);

const useLoadAlbums = (props: BaseQueryProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<LookAlbumsQuery>({
    queryKey: ['look-albums'],
    getAccessToken,
    document: albumsQuery,
  });

  return {
    albums: data ? data.playlist.map(transformAlbumFragment) : [],
    isLoading,
    error,
  };
};

const useLoadAlbumDetail = (props: DetailQueryProps) => {
  const { id, getAccessToken } = props;

  const { data, isLoading, error } = useRequest<
    LookAlbumDetailQuery,
    { id: string }
  >({
    queryKey: ['look-album-detail', id],
    getAccessToken,
    document: albumDetailQuery,
    variables: {
      id,
    },
  });

  return {
    album: data?.playlist_by_pk
      ? transformAlbumFragment(data.playlist_by_pk)
      : null,
    isLoading,
    error,
  };
};

export { useLoadAlbumDetail, useLoadAlbums };
