import { graphql } from '../../../graphql';
import { PlaylistDetailQuery } from '../../../graphql/graphql';
import { AppError } from '../../../universal/error-boundary/app-error';
import { useRequest } from '../../../universal/hooks/use-request';

const playlistDetailQuery = graphql(/* GraphQL */ `
  query PlaylistDetail($id: uuid!) {
    playlist_by_pk(id: $id) {
      id
      title
      slug
      public
      playlist_videos(order_by: { position: asc }) {
        position
        video {
          id
          title
          thumbnailUrl
          source
          slug
          duration
          description
          createdAt
          user {
            username
          }
          user_video_histories {
            last_watched_at
            progress_seconds
          }
        }
      }
    }
  }
`);

interface LoadPlaylistDetailProps {
  id: string;
  getAccessToken: () => Promise<string>;
}

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

  const videos =
    data?.playlist_by_pk?.playlist_videos
      .sort((a, b) => a.position - b.position)
      .map(({ video }) => {
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
      }) || [];

  return {
    videos: videos,
    videoDetail: videos[0] || null,
    isLoading,
    error,
  };
};

export { useLoadPlaylistDetail };
