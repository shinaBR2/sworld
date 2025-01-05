// import { graphql } from '../../graphql';
import { useRequest } from '../../universal/hooks/use-request';

const videoDetailQuery = `
  query AllVideos ($id: uuid!) @cached {
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
    videos_by_pk(id: $id) {
      id
      source
      thumbnailUrl
      title
      description
    }
  }
`;

interface User {
  username: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  source: string;
  slug: string;
  createdAt: string;
  user: User;
}

interface VideoDetail {
  id: string;
  source: string;
  thumbnailUrl: string;
  title: string;
  description: string;
}

interface LoadVideosProps {
  id: string;
  getAccessToken: () => Promise<string>;
}

interface VideoDetailResponse {
  videos: Video[];
  videos_by_pk: VideoDetail | null;
}

const useLoadVideoDetail = (props: LoadVideosProps) => {
  const { id, getAccessToken } = props;

  const { data, isLoading } = useRequest<VideoDetailResponse>({
    queryKey: ['video-detail', id],
    getAccessToken,
    document: videoDetailQuery,
    variables: {
      id,
    },
  });

  return {
    videos: data?.videos ?? [],
    videoDetail: data?.videos_by_pk ?? null,
    isLoading,
  };
};

export { useLoadVideoDetail };
