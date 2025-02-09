import { useRequest } from '../../../universal/hooks/use-request';

const videoDetailQuery = `
  query VideoDetail ($id: uuid!) @cached {
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
      user_video_histories {
        last_watched_at
        progress_seconds
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

interface LoadVideoDetailProps {
  id: string;
  getAccessToken: () => Promise<string>;
}

interface VideoDetailResponse {
  videos: Video[];
  videos_by_pk: VideoDetail | null;
}

const transformVideoData = video => {
  const history = video.user_video_histories[0];

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    source: video.source,
    slug: video.slug,
    createdAt: video.createdAt,
    user: video.user,
    lastWatchedAt: history?.last_watched_at ?? null,
    progressSeconds: history?.progress_seconds ?? 0,
  };
};

const useLoadVideoDetail = (props: LoadVideoDetailProps) => {
  const { id, getAccessToken } = props;

  const { data, isLoading, error } = useRequest<VideoDetailResponse>({
    queryKey: ['video-detail', id],
    getAccessToken,
    document: videoDetailQuery,
    variables: {
      id,
    },
  });

  return {
    videos: data?.videos.map(transformVideoData) || [],
    videoDetail: data?.videos_by_pk ?? {},
    isLoading,
    error,
  };
};

export { useLoadVideoDetail };
