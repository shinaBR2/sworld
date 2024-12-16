import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useQueryContext } from '../../providers/query';

const videosQuery = `
  query AllVideos {
    videos {
      id
      title
      description
      source
      slug
    }
  }
`;

interface LoadVideosProps {
  getAccessToken: () => Promise<string>;
}

const useLoadVideos = (props: LoadVideosProps) => {
  const { getAccessToken } = props;

  const { hasuraUrl } = useQueryContext();
  const { data, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      // TODO
      // Handle token error
      const token = await getAccessToken();
      return await request({
        url: hasuraUrl,
        // @ts-ignore
        document: videosQuery,
        requestHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });

  return {
    // @ts-ignore
    videos: data?.videos,
    isLoading,
  };
};

export { useLoadVideos };
