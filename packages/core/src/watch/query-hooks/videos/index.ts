import { FragmentType, getFragmentData, graphql } from '../../../graphql';
import { AllVideosQuery } from '../../../graphql/graphql';
import { AppError } from '../../../universal/error-boundary/app-error';
import { useRequest } from '../../../universal/hooks/use-request';
import { PlaylistFragment, PlaylistVideoFragment, UserFragment, VideoFragment } from '../fragments';
import { transformVideoFragment } from '../transformers';
import { MEDIA_TYPES } from '../types';

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

// interface BaseVideoInfo {
//   id: string;
//   title: string;
//   description: string;
//   thumbnailUrl: string;
//   slug: string;
//   createdAt: string;
//   user: User | null;
//   type: MediaType;
// }

// interface TransformedVideo extends BaseVideoInfo {
//   source: string;
//   duration: number;
//   lastWatchedAt: string | null;
//   progressSeconds: number;
// }

// interface TransformedPlaylist extends BaseVideoInfo {
//   firstVideoId: string;
// }

// type TransformedMediaItem = TransformedVideo | TransformedPlaylist;

const transformPlaylist = (playlistFragmentData: FragmentType<typeof PlaylistFragment>) => {
  const playlist = getFragmentData(PlaylistFragment, playlistFragmentData);
  const user = {
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

const transform = (data: AllVideosQuery) => {
  const { videos, playlist } = data;
  const standaloneVideos = videos?.map(transformVideoFragment) || [];
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

export { useLoadVideos };
