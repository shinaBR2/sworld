import { graphql } from '../../../graphql';
import type { UserVideoHistoryQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformUser } from '../transformers';
import { type BaseQueryProps, MEDIA_TYPES } from '../types';

const historyQuery = graphql(/* GraphQL */ `
  query UserVideoHistory {
    user_video_history(
      where: {
        _and: {
          last_watched_at: { _is_null: false }
          progress_seconds: { _gt: 0 }
          video: { source: { _is_null: false } }
        }
      }
      order_by: { last_watched_at: desc }
    ) {
      id
      last_watched_at
      progress_seconds
      video {
        id
        title
        source
        slug
        thumbnailUrl
        duration
        createdAt
        user {
          ...UserFields
        }
        playlist_videos {
          playlist {
            id
            slug
            title
            thumbnailUrl
          }
        }
      }
    }
  }
`);

const transform = (data: UserVideoHistoryQuery) => {
  const videos = data.user_video_history.map((item) => {
    const {
      last_watched_at: lastWatchedAt,
      progress_seconds: progressSeconds,
      video,
    } = item;
    // Video can belong to many playlist
    // For now it's fine because all videos has one playlist only
    const playlist = video.playlist_videos[0]?.playlist;
    const user = transformUser(video.user);

    return {
      id: video.id,
      type: MEDIA_TYPES.VIDEO,
      title: video.title,
      source: video.source || '',
      slug: video.slug,
      thumbnailUrl: video.thumbnailUrl || '',
      duration: video.duration || 0,
      createdAt: video.createdAt,
      lastWatchedAt,
      progressSeconds,
      playlist,
      user,
    };
  });

  return videos;
};

const useLoadHistory = (props: BaseQueryProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<UserVideoHistoryQuery>({
    queryKey: ['history'],
    getAccessToken,
    document: historyQuery,
  });

  return {
    videos: data ? transform(data) : [],
    isLoading,
    error,
  };
};

export { useLoadHistory };
