import { BulkConvertVariables } from 'core/watch/mutation-hooks/bulk-convert';
import { DialogState } from './types';
import { ValidationResult } from './validation-results';
import { slugify } from 'core/universal/common';

const CLOSE_DELAY_MS = 3000;
const CREATE_NEW_PLAYLIST = '__create-new';

let cachedCanPlay: ((url: string) => boolean) | null = null;

const loadReactPlayerCanPlay = async () => {
  if (cachedCanPlay) return cachedCanPlay;

  const ReactPlayer = await import('react-player');
  cachedCanPlay = ReactPlayer.default.canPlay;

  return cachedCanPlay;
};

const canPlayUrls = async (urls: string[]): Promise<ValidationResult[]> => {
  const canPlay = await loadReactPlayerCanPlay();

  return Promise.all(
    urls
      .filter(url => url != null)
      .map(url => url!.trim())
      .filter(Boolean)
      .map(async url => ({
        url,
        isValid: canPlay(url),
      }))
  );
};

const buildVariables = (dialogState: DialogState) => {
  const { title, description = '', url, playlistId, newPlaylistName, videoPositionInPlaylist = 0 } = dialogState;

  const variables: BulkConvertVariables = {
    objects: [
      {
        title,
        description,
        slug: slugify(title),
        video_url: url,
      },
    ],
  };

  if (playlistId || newPlaylistName) {
    const playlistVideoData = playlistId
      ? { playlist_id: playlistId, position: videoPositionInPlaylist }
      : {
          position: videoPositionInPlaylist,
          playlist: {
            data: {
              title: newPlaylistName!,
              slug: slugify(newPlaylistName!),
            },
          },
        };

    variables.objects[0].playlist_videos = {
      data: [playlistVideoData],
    };
  }

  return variables;
};

export { CLOSE_DELAY_MS, CREATE_NEW_PLAYLIST, canPlayUrls, buildVariables };
