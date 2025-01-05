import { useRequest } from '../../universal/hooks/use-request';

const videosQuery = `
  query AllVideos @cached {
    videos {
      id
      title
      description
      thumbnailUrl
      source
      slug
      createdAt
      user {
        username
      }
    }
  }
`;

interface LoadVideosProps {
  getAccessToken: () => Promise<string>;
}

const useLoadVideos = (props: LoadVideosProps) => {
  const { getAccessToken } = props;

  const { data, isLoading } = useRequest({
    queryKey: ['videos'],
    getAccessToken,
    document: videosQuery,
  });

  return {
    // @ts-ignore
    videos: data?.videos,
    isLoading,
  };
};

export { useLoadVideos };
