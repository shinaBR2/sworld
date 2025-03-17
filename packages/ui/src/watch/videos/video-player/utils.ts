const getVideoSources = (videoUrl: string) => {
  if (videoUrl.includes('youtu.be') || videoUrl.includes('youtube.com')) {
    return [{ type: 'video/youtube', src: videoUrl }];
  } else if (videoUrl.includes('vimeo.com')) {
    return [{ type: 'video/vimeo', src: videoUrl }];
  } else if (videoUrl.endsWith('.m3u8')) {
    return [{ type: 'application/x-mpegURL', src: videoUrl }];
  } else if (videoUrl.endsWith('.mp4')) {
    return [{ type: 'video/mp4', src: videoUrl }];
  } else {
    // Default to HLS if we can't determine the type
    return [{ type: 'application/x-mpegURL', src: videoUrl }];
  }
};

const getVideoPlayerOptions = (videoUrl: string, baseOptions = {}) => {
  const sources = getVideoSources(videoUrl);
  const isYoutube = sources[0].type === 'video/youtube';
  const isVimeo = sources[0].type === 'video/vimeo';

  return {
    ...baseOptions,
    techOrder: isYoutube ? ['youtube', 'html5'] : isVimeo ? ['vimeo', 'html5'] : ['html5'],
    sources,
  };
};

export { getVideoPlayerOptions };
