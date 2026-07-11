import { TypedDocumentString } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import type { BaseQueryProps } from '../types';

interface ManageVideosQueryData {
  videos?: Array<{
    id: unknown;
    title: string;
    source?: string | null;
    slug: string;
    createdAt: unknown;
    playlist_videos: Array<{
      playlist: {
        id: unknown;
        title: string;
        slug: string;
      };
    }>;
  }> | null;
  playlist?: Array<{
    id: unknown;
    title: string;
    slug: string;
  }> | null;
}

interface ManageVideosVariables {
  userId: string;
}

const manageVideosQuery = new TypedDocumentString(`
  query ManageVideos($userId: uuid!) {
    videos(
      where: { user_id: { _eq: $userId } }
      order_by: { createdAt: desc }
    ) {
      id
      title
      source
      slug
      createdAt
      playlist_videos {
        playlist {
          id
          title
          slug
        }
      }
    }
    playlist(
      where: { user_id: { _eq: $userId } }
      order_by: { createdAt: desc }
    ) {
      id
      title
      slug
    }
  }
`) as unknown as TypedDocumentString<
  ManageVideosQueryData,
  ManageVideosVariables
>;

interface ManageVideosProps extends BaseQueryProps {
  userId: string;
}

const useLoadManageVideos = (props: ManageVideosProps) => {
  const { getAccessToken, userId } = props;

  const { data, isLoading, error } = useRequest<
    ManageVideosQueryData,
    ManageVideosVariables
  >({
    queryKey: ['manage-videos', userId],
    getAccessToken,
    document: manageVideosQuery,
    variables: { userId },
  });

  return {
    videos: data?.videos ?? [],
    playlists: data?.playlist ?? [],
    isLoading,
    error,
  };
};

export { useLoadManageVideos };
