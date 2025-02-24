import { FragmentType, getFragmentData } from '../../graphql';
import { AppError } from '../../universal/error-boundary/app-error';
import { UserFragment, VideoFragment } from './fragments';
import { MEDIA_TYPES } from './types';

const transformVideoFragment = (videoData: FragmentType<typeof VideoFragment>) => {
  const video = getFragmentData(VideoFragment, videoData);
  if (!video.source) {
    // TODO
    // Use error code instead of hard code strings
    throw new AppError('Required video fields are missing', 'Video data is missing', false);
  }

  const history = video?.user_video_histories?.[0];
  const user = {
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

export { transformVideoFragment };
