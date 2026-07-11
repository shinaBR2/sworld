import { graphql } from '../../graphql';
import type { WatchManageQuery } from '../../graphql/graphql';
import { useAuthContext } from '../../providers/auth';
import { useRequest } from '../../universal/hooks/use-request';

const manageQuery = graphql(/* GraphQL */ `
  query WatchManage($userId: uuid!) {
    videos(
      where: { user_id: { _eq: $userId } }
      order_by: { createdAt: desc }
    ) {
      id
      title
      thumbnailUrl
      duration
      source
      status
      slug
      createdAt
    }
    playlist(
      where: { user_id: { _eq: $userId }, site: { _eq: "watch" } }
      order_by: { createdAt: desc }
    ) {
      id
      title
      slug
      description
      thumbnailUrl
    }
  }
`);

const useLoadManage = () => {
  const { user, getAccessToken } = useAuthContext();
  const userId = user?.id ?? '';

  const { data, isLoading, error } = useRequest<
    WatchManageQuery,
    { userId: string }
  >({
    queryKey: ['watch-manage'],
    getAccessToken,
    document: manageQuery,
    variables: { userId },
    enabled: Boolean(userId),
  });

  return {
    videos: data?.videos ?? [],
    playlists: data?.playlist ?? [],
    isLoading,
    error,
  };
};

export { useLoadManage };
