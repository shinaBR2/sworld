import { graphql } from '../../../graphql';
import type { AllVideosQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import {
  transformPlaylistFragment,
  transformUser,
  transformVideoFragment,
} from '../transformers';
import { MEDIA_TYPES } from '../types';
import { isVideoFinished } from '../utils';

const videosQuery = graphql(/* GraphQL */ `
  query AllVideos @cached {
    videos(
      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: "ready" } } }
      order_by: { createdAt: desc }
    ) {
      ...VideoFields
    }
    playlist(
      where: {
        playlist_videos_aggregate: { count: { predicate: { _gt: 0 }, filter: { video: { status: { _eq: "ready" } } } } }
      }
    ) {
      ...PlaylistFields
    }
    user_video_history(
      where: {
        _and: {
          last_watched_at: { _is_null: false }
          progress_seconds: { _gt: 0 }
          video: { source: { _is_null: false } }
        }
      }
      order_by: { last_watched_at: desc }
      limit: 5
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

interface LoadVideosProps {
  getAccessToken: () => Promise<string>;
}

const transform = (data: AllVideosQuery) => {
  const { videos, playlist } = data;
  const standaloneVideos = videos?.map(transformVideoFragment) || [];
  const playlistVideos = playlist?.map(transformPlaylistFragment) || [];
  const merged = [...standaloneVideos, ...playlistVideos];
  const sorted = merged.sort((a, b) => {
    if (!a.createdAt || !b.createdAt) {
      return 0;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  return sorted;
};

// Own transform for this query's user_video_history selection — the most
// recently watched videos for the "Continue watching" row. Kept local to
// useLoadVideos rather than shared with useLoadHistory: each query declares
// what it selects and maps it independently.
const transformContinueWatching = (data: AllVideosQuery) => {
  if (!data.user_video_history) {
    return [];
  }

  return data.user_video_history
    .filter(
      (item) =>
        !isVideoFinished({
          progressSeconds: item.progress_seconds,
          duration: item.video.duration || 0,
        }),
    )
    .map((item) => {
      const {
        last_watched_at: lastWatchedAt,
        progress_seconds: progressSeconds,
        video,
      } = item;
      // A video can belong to many playlists; today each has at most one.
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
};

const useLoadVideos = (props: LoadVideosProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<AllVideosQuery>({
    queryKey: ['videos'],
    getAccessToken,
    document: videosQuery,
  });

  return {
    videos: data ? transform(data) : [],
    continueWatching: data ? transformContinueWatching(data) : [],
    isLoading,
    error,
  };
};

export { useLoadVideos };
