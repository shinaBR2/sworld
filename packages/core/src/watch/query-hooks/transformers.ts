import { FragmentType, getFragmentData } from '../../graphql';
import { AppError } from '../../universal/error-boundary/app-error';
import { PlaylistFragment, PlaylistVideoFragment, UserFragment, VideoFragment } from './fragments';
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

const transformPlaylistFragment = (playlistFragmentData: FragmentType<typeof PlaylistFragment>) => {
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

export { transformVideoFragment, transformPlaylistFragment };
