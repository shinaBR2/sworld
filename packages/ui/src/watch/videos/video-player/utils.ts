const getVideoSources = (videoUrl: string) => {
  if (videoUrl.includes('youtu.be') || videoUrl.includes('youtube.com')) {
    return [{ type: 'video/youtube', src: videoUrl }];
  } else {
    return [{ type: 'application/x-mpegURL', src: videoUrl }];
  }
};

const getVideoPlayerOptions = (videoUrl: string, baseOptions = {}) => {
  const sources = getVideoSources(videoUrl);
  const isYoutube = sources[0].type === 'video/youtube';

  return {
    ...baseOptions,
    techOrder: isYoutube ? ['youtube', 'html5'] : ['html5'],
    sources,
  };
};

export { getVideoPlayerOptions };
