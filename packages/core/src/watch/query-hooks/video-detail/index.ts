import { graphql } from '../../../graphql';
import { VideoDetailQuery } from '../../../graphql/graphql';
import { AppError } from '../../../universal/error-boundary/app-error';
import { useRequest } from '../../../universal/hooks/use-request';

const videoDetailQuery = graphql(`
  query VideoDetail($id: uuid!) @cached {
    videos(where: { source: { _is_null: false } }, order_by: { createdAt: desc }) {
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
`);

interface LoadVideoDetailProps {
  id: string;
  getAccessToken: () => Promise<string>;
}

type VideoItem = VideoDetailQuery['videos'][0];

const transformVideoData = (video: VideoItem) => {
  if (!video.id || !video.title || !video.slug || !video.source || !video.createdAt) {
    // TODO
    // Use error code instead of hard code strings
    throw new AppError('Required video fields are missing', 'Video data is missing', false);
  }

  const history = video?.user_video_histories?.[0];

  return {
    id: video.id,
    title: video.title,
    description: video.description || '',
    thumbnailUrl: video.thumbnailUrl || '',
    source: video.source,
    slug: video.slug,
    duration: video.duration || 0,
    createdAt: video.createdAt,
    user: video.user,
    lastWatchedAt: history?.last_watched_at ?? null,
    progressSeconds: history?.progress_seconds ?? 0,
  };
};

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
    videos: data?.videos.map(transformVideoData) || [],
    videoDetail: data?.videos_by_pk ?? null,
    isLoading,
    error,
  };
};

export { useLoadVideoDetail, type VideoItem };
