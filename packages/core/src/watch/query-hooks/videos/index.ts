import { FragmentType, getFragmentData, graphql } from '../../../graphql';
import { AllVideosQuery } from '../../../graphql/graphql';
import { AppError } from '../../../universal/error-boundary/app-error';
import { useRequest } from '../../../universal/hooks/use-request';
import { PlaylistFragment, PlaylistVideoFragment, UserFragment, VideoFragment } from '../fragments';

const videosQuery = graphql(/* GraphQL */ `
  query AllVideos @cached {
    videos(
      where: { _and: { _not: { playlist_videos: {} }, source: { _is_null: false } } }
      order_by: { createdAt: desc }
    ) {
      ...VideoFields
    }
    playlist(where: { playlist_videos: {} }) {
      ...PlaylistFields
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

interface TransformedPlaylist extends BaseVideoInfo {
  firstVideoId: string;
}

type TransformedMediaItem = TransformedVideo | TransformedPlaylist;

const transformVideoData = (videoFragmentData: FragmentType<typeof VideoFragment>): TransformedVideo => {
  const video = getFragmentData(VideoFragment, videoFragmentData);
  if (!video.source) {
    // TODO
    // Use error code instead of hard code strings
    throw new AppError('Required video fields are missing', 'Video data is missing', false);
  }

  const history = video.user_video_histories[0];
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

const transformPlaylist = (playlistFragmentData: FragmentType<typeof PlaylistFragment>): TransformedPlaylist => {
  const playlist = getFragmentData(PlaylistFragment, playlistFragmentData);
  const user: User = {
    username: getFragmentData(UserFragment, playlist.user).username || '',
  };

  if (!playlist.playlist_videos.length) {
    throw new AppError('Playlist has no videos', 'Playlist has no videos', false);
  }

  const firstPlaylistVideo = getFragmentData(PlaylistVideoFragment, playlist.playlist_videos[0]);
  const firstVideo = getFragmentData(VideoFragment, firstPlaylistVideo.video);

  return {
    id: playlist.id,
    type: MEDIA_TYPES.PLAYLIST,
    title: playlist.title,
    thumbnailUrl: playlist.thumbnailUrl,
    slug: playlist.slug,
    createdAt: playlist.createdAt,
    description: playlist.description || '',
    user,
    firstVideoId: firstVideo.id,
  };
};

const transform = (data: AllVideosQuery): TransformedMediaItem[] => {
  const { videos, playlist } = data;
  const standaloneVideos = videos?.map(transformVideoData) || [];
  const playlistVideos = playlist?.map(transformPlaylist) || [];
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
