import { graphql } from '../../../graphql';
import { VideoDetailQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformVideoFragment } from '../transformers';

const videoDetailQuery = graphql(`
  query VideoDetail($id: uuid!) @cached {
    videos(
      where: { _and: { _not: { playlist_videos: {} }, source: { _is_null: false } } }
      order_by: { createdAt: desc }
    ) {
      ...VideoFields
    }
    videos_by_pk(id: $id) {
      id
      source
      thumbnailUrl
      title
      description
    }
  }
`);

interface LoadVideoDetailProps {
  id: string;
  getAccessToken: () => Promise<string>;
}

const useLoadVideoDetail = (props: LoadVideoDetailProps) => {
  const { id, getAccessToken } = props;

  const { data, isLoading, error } = useRequest<VideoDetailQuery, { id: string }>({
    queryKey: ['video-detail', id],
    getAccessToken,
    document: videoDetailQuery,
    variables: {
      id,
    },
  });

  return {
    videos: data?.videos.map(transformVideoFragment) || [],
    playlist: null,
    isLoading,
    error,
  };
};

export { useLoadVideoDetail };
