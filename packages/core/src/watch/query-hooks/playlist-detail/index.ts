import { getFragmentData, graphql } from '../../../graphql';
import { PlaylistDetailQuery } from '../../../graphql/graphql';
import { AppError } from '../../../universal/error-boundary/app-error';
import { useRequest } from '../../../universal/hooks/use-request';
import { PlaylistFragment, PlaylistVideoFragment, UserFragment, VideoFragment } from '../fragments';
import { MEDIA_TYPES } from '../videos';

const playlistDetailQuery = graphql(/* GraphQL */ `
  query PlaylistDetail($id: uuid!) {
    playlist_by_pk(id: $id) {
      ...PlaylistFields
    }
  }
`);

interface User {
  username: string;
}

interface LoadPlaylistDetailProps {
  id: string;
  getAccessToken: () => Promise<string>;
}

const transform = (data: PlaylistDetailQuery) => {
  const playlist = getFragmentData(PlaylistFragment, data.playlist_by_pk);
  const videos =
    getFragmentData(PlaylistVideoFragment, playlist?.playlist_videos)
      ?.sort((a, b) => a.position - b.position)
      .map(({ video: videoData }) => {
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
      }) || [];

  return {
    videos,
    videoDetail: videos[0] || null,
    playlist,
  };
};

const useLoadPlaylistDetail = (props: LoadPlaylistDetailProps) => {
  const { id, getAccessToken } = props;

  const { data, isLoading, error } = useRequest<PlaylistDetailQuery, { id: string }>({
    queryKey: ['playlist-detail', id],
    getAccessToken,
    document: playlistDetailQuery,
    variables: {
      id,
    },
  });

  // const videos =
  //   data?.playlist_by_pk?.playlist_videos
  //     .sort((a, b) => a.position - b.position)
  //     .map(({ video }) => {
  //       if (!video.id || !video.title || !video.slug || !video.source || !video.createdAt) {
  //         // TODO
  //         // Use error code instead of hard code strings
  //         throw new AppError('Required video fields are missing', 'Video data is missing', false);
  //       }

  //       const history = video?.user_video_histories?.[0];
  //       const user: User | null = video.user ? { username: video.user.username || '' } : null;

  //       return {
  //         id: video.id,
  //         type: MEDIA_TYPES.VIDEO,
  //         title: video.title,
  //         description: video.description || '',
  //         thumbnailUrl: video.thumbnailUrl || '',
  //         source: video.source,
  //         slug: video.slug,
  //         duration: video.duration || 0,
  //         createdAt: video.createdAt,
  //         user,
  //         lastWatchedAt: history?.last_watched_at ?? null,
  //         progressSeconds: history?.progress_seconds ?? 0,
  //       };
  //     }) || [];

  const transformed = data
    ? transform(data)
    : {
        videos: [],
        videoDetail: null,
        playlist: null,
      };

  return {
    ...transformed,
    // videos: videos,
    // videoDetail: videos[0] || null,
    // playlist: data?.playlist_by_pk
    //   ? {
    //       id: data.playlist_by_pk.id,
    //       title: data.playlist_by_pk.title,
    //       slug: data.playlist_by_pk.slug,
    //     }
    //   : null,
    isLoading,
    error,
  };
};

export { useLoadPlaylistDetail };
