import type { PlayableVideo } from '../types';

const getVideoSources = (videoUrl: string) => {
  if (videoUrl.includes('youtu.be') || videoUrl.includes('youtube.com')) {
    return [{ type: 'video/youtube', src: videoUrl }];
  } else {
    return [{ type: 'application/x-mpegURL', src: videoUrl }];
  }
};

const getVideoPlayerOptions = (video: PlayableVideo, baseOptions = {}) => {
  const { source, subtitles } = video;
  const sources = getVideoSources(source);
  const isYoutube = sources[0].type === 'video/youtube';

  const options = {
    ...baseOptions,
    techOrder: isYoutube ? ['youtube', 'html5'] : ['html5'],
    sources,
  };

  if (subtitles?.length) {
    return {
      ...options,
      tracks: subtitles.map(({ src, lang, isDefault, label }) => ({
        kind: 'captions',
        src,
        default: isDefault,
        lang,
        label,
      })),
    };
  }

  return options;
};

export { getVideoPlayerOptions };
