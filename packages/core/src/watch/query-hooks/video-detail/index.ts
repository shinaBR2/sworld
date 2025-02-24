import { FragmentType, getFragmentData, graphql } from '../../../graphql';
import { VideoDetailQuery } from '../../../graphql/graphql';
import { AppError } from '../../../universal/error-boundary/app-error';
import { useRequest } from '../../../universal/hooks/use-request';
import { UserFragment, VideoFragment } from '../fragments';
import { MEDIA_TYPES } from '../videos';

const videoDetailQuery = graphql(`
  query VideoDetail($id: uuid!) @cached {
    videos(where: { source: { _is_null: false } }, order_by: { createdAt: desc }) {
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

type VideoItem = VideoDetailQuery['videos'][0];
interface User {
  username: string;
}

const transformVideoData = (videoData: FragmentType<typeof VideoFragment>) => {
  const video = getFragmentData(VideoFragment, videoData);
  if (!video.source) {
    // TODO
    // Use error code instead of hard code strings
    throw new AppError('Required video fields are missing', 'Video data is missing', false);
  }

  const history = video?.user_video_histories?.[0];
  const user: User = {
    username: getFragmentData(UserFragment, video.user).username || '',
  };

  return {
    id: video.id,
    type: MEDIA_TYPES.VIDEO,
    title: video.title,
    description: video.description || '',
    thumbnailUrl: video.thumbnailUrl || '',
    source: video.source,
    slug: video.slug,
    duration: video.duration || 0,
    createdAt: video.createdAt,
    user,
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
    videoDetail: data?.videos_by_pk ?? null, // TODO getFragmentData
    playlist: null,
    isLoading,
    error,
  };
};

export { useLoadVideoDetail, type VideoItem };
