import { useRequest } from '../../../universal/hooks/use-request';

const videoDetailQuery = `
  query VideoDetail ($id: uuid!) @cached {
    videos(order_by: {createdAt: desc})  {
      id
      title
      description
      thumbnailUrl
      source
      slug
      duration
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

interface VideoHistory {
  last_watched_at: string;
  progress_seconds: number;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  source: string;
  slug: string;
  duration: number;
  createdAt: string;
  user: User;
  user_video_histories?: VideoHistory[];
}

interface VideoDetail {
  id: string;
  source: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  duration: number;
}

interface LoadVideoDetailProps {
  id: string;
  getAccessToken: () => Promise<string>;
}

interface VideoDetailResponse {
  videos: Video[];
  videos_by_pk: VideoDetail | null;
}

const transformVideoData = (video: Video) => {
  const history = video?.user_video_histories?.[0];

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    source: video.source,
    slug: video.slug,
    duration: video.duration,
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
