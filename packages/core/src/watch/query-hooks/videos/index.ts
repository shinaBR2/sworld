import { useRequest } from '../../../universal/hooks/use-request';

const videosQuery = `
  query AllVideos @cached {
    videos {
      user_video_histories {
        last_watched_at
        progress_seconds
      }
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

interface User {
  username: string;
}

interface VideoHistory {
  last_watched_at: string;
  progress_seconds: number;
}

interface VideoResponse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  source: string;
  slug: string;
  createdAt: string;
  user: User;
  user_video_histories: VideoHistory[];
}

interface TransformedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  source: string;
  slug: string;
  createdAt: string;
  user: User;
  lastWatchedAt: string | null;
  progressSeconds: number;
}

const transformVideoData = (video: VideoResponse): TransformedVideo => {
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

const useLoadVideos = (props: LoadVideosProps) => {
  const { getAccessToken } = props;

  const { data, isLoading } = useRequest<{ videos: VideoResponse[] }>({
    queryKey: ['videos'],
    getAccessToken,
    document: videosQuery,
  });

  return {
    videos: data?.videos.map(transformVideoData),
    isLoading,
  };
};

export { useLoadVideos };
