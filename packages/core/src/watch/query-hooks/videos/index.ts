import { graphql } from '../../../graphql';
import { AllVideosQuery } from '../../../graphql/graphql';
import { AppError } from '../../../universal/error-boundary/app-error';
import { useRequest } from '../../../universal/hooks/use-request';

const videosQuery = graphql(`
  query AllVideos @cached {
    videos(
      where: { _and: { _not: { playlist_videos: {} }, source: { _is_null: false } } }
      order_by: { createdAt: desc }
    ) {
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
    playlist(where: { playlist_videos: {} }) {
      id
      title
      thumbnailUrl
      slug
      createdAt
      description
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

const MEDIA_TYPES = {
  VIDEO: 'video',
  PLAYLIST: 'playlist',
} as const;

type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];
interface BaseVideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  slug: string;
  createdAt: string;
  user: User | null;
  type: MediaType;
}

interface TransformedVideo extends BaseVideoInfo {
  source: string;
  duration: number;
  lastWatchedAt: string | null;
  progressSeconds: number;
}

interface TransformedPlaylist extends BaseVideoInfo {}

type TransformedMediaItem = TransformedVideo | TransformedPlaylist;

const transformVideoData = (video: AllVideosQuery['videos'][0]): TransformedVideo => {
  if (!video.id || !video.title || !video.slug || !video.source || !video.createdAt) {
    // TODO
    // Use error code instead of hard code strings
    throw new AppError('Required video fields are missing', 'Video data is missing', false);
  }

  const history = video.user_video_histories[0];
  const user: User | null = video.user ? { username: video.user.username || '' } : null;

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

const transformPlaylist = (playlist: AllVideosQuery['playlist'][0]): TransformedPlaylist => {
  if (!playlist.id || !playlist.title || !playlist.slug || !playlist.thumbnailUrl || !playlist.createdAt) {
    // TODO
    // Use error code instead of hard code strings
    throw new AppError('Required playlist fields are missing', 'Playlist data is missing', false);
  }

  const user: User | null = playlist.user ? { username: playlist.user.username || '' } : null;

  return {
    id: playlist.id,
    type: MEDIA_TYPES.PLAYLIST,
    title: playlist.title,
    thumbnailUrl: playlist.thumbnailUrl,
    slug: playlist.slug,
    createdAt: playlist.createdAt,
    description: playlist.description || '',
    user,
  };
};

const transform = (data: AllVideosQuery): TransformedMediaItem[] => {
  const { videos, playlist } = data;
  const standaloneVideos = videos.map(transformVideoData);
  const playlistVideos = playlist.map(transformPlaylist);
  const merged = [...standaloneVideos, ...playlistVideos];
  const sorted = merged.sort((a, b) => {
    return (b.createdAt as string).localeCompare(a.createdAt as string);
  });

  return sorted;
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
    isLoading,
    error,
  };
};

export {
  useLoadVideos,
  MEDIA_TYPES,
  type MediaType,
  type TransformedVideo,
  type TransformedPlaylist,
  type TransformedMediaItem,
};
