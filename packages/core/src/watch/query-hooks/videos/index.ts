import { graphql } from '../../../graphql';
import { AllVideosQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';

const videosQuery = graphql(`
  query AllVideos @cached {
    videos(order_by: { createdAt: desc }) {
      user_video_histories {
        last_watched_at
        progress_seconds
      }
      id
      title
      description
      duration
      thumbnailUrl
      source
      slug
      createdAt
      user {
        username
      }
    }
  }
`);

interface LoadVideosProps {
  getAccessToken: () => Promise<string>;
}

interface User {
  username: string;
}

interface TransformedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  source: string;
  slug: string;
  duration: number;
  createdAt: string;
  user: User | null;
  lastWatchedAt: string | null;
  progressSeconds: number;
}

const transformVideoData = (video: AllVideosQuery['videos'][0]): TransformedVideo => {
  const history = video.user_video_histories[0];
  const user: User | null = video.user ? { username: video.user.username || '' } : null;

  return {
    id: video.id,
    title: video.title,
    description: video.description || '',
    thumbnailUrl: video.thumbnailUrl || '',
    source: video.source || '',
    slug: video.slug,
    duration: video.duration || 0,
    createdAt: video.createdAt,
    user,
    lastWatchedAt: history?.last_watched_at ?? null,
    progressSeconds: history?.progress_seconds ?? 0,
  };
};

const useLoadVideos = (props: LoadVideosProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<AllVideosQuery>({
    queryKey: ['videos'],
    getAccessToken,
    document: videosQuery,
  });

  return {
    videos: data?.videos.map(transformVideoData) || [],
    isLoading,
    error,
  };
};

export { useLoadVideos };
