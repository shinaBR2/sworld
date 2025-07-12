import { slugify } from 'core/universal/common';
import { BulkConvertVariables } from 'core/watch/mutation-hooks/bulk-convert';
import { DialogState } from './types';
import { ValidationResult } from './validation-results';

const CLOSE_DELAY_MS = 3000;
const CREATE_NEW_PLAYLIST = '__create-new';

// Updated URL validation patterns
const MATCH_URL_YOUTUBE =
  /(?:youtu\.be\/|youtube(?:-nocookie|education)?\.com\/(?:embed\/|v\/|watch\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//;
const HLS_EXTENSIONS = /\.(m3u8)($|\?)/i;
const VIDEO_EXTENSIONS = /\.(mp4|mov|m4v|ts|webm|mkv)($|\?)/i; // Added more video formats

const canPlay = (url: string) => {
  const isYouTube = MATCH_URL_YOUTUBE.test(url);
  const isHLS = HLS_EXTENSIONS.test(url);
  const isVideo = VIDEO_EXTENSIONS.test(url);
  return isYouTube || isHLS || isVideo;
};

// Replace the async canPlayUrls with this version
const canPlayUrls = (urls: string[]): ValidationResult[] => {
  return urls
    .filter(url => url != null)
    .map(url => url!.trim())
    .filter(Boolean)
    .map(url => ({
      url,
      isValid: canPlay(url),
    }));
};

const formalizeState = (dialogState: DialogState) => {
  const {
    title,
    description,
    url,
    subtitle,
    playlistId,
    newPlaylistName,
    videoPositionInPlaylist,
    keepOriginalSource,
  } = dialogState;

  return {
    title: title?.trim(),
    description: description?.trim() || '',
    url: url?.trim(),
    subtitle: subtitle?.trim() || '',
    playlistId,
    newPlaylistName: newPlaylistName?.trim(),
    videoPositionInPlaylist: videoPositionInPlaylist ?? 0,
    keepOriginalSource,
  };
};

const buildVariables = (dialogState: DialogState) => {
  const {
    title,
    description = '',
    url,
    subtitle = '',
    playlistId,
    newPlaylistName,
    videoPositionInPlaylist = 0,
    keepOriginalSource = false,
  } = formalizeState(dialogState);

  const variables: BulkConvertVariables = {
    objects: [
      {
        title,
        description,
        slug: slugify(title),
        video_url: url,
        keepOriginalSource,
      },
    ],
  };

  const isCreateNewPlaylist = playlistId === CREATE_NEW_PLAYLIST && newPlaylistName;
  const isUseExistedPlaylist = playlistId && playlistId !== CREATE_NEW_PLAYLIST;

  if (isCreateNewPlaylist || isUseExistedPlaylist) {
    const playlistVideoData = isUseExistedPlaylist
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

  if (subtitle) {
    variables.objects[0].subtitles = {
      data: [
        {
          urlInput: subtitle,
          lang: 'vi',
          isDefault: true,
        },
      ],
    };
  }

  return variables;
};

export { buildVariables, canPlayUrls, CLOSE_DELAY_MS, CREATE_NEW_PLAYLIST, formalizeState };
