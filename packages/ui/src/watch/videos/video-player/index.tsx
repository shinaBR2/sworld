import { lazy, Suspense } from 'react';
import Box from '@mui/material/Box';
import { PlayableVideo } from '../types';

// Lazy load the VideoJS component that contains video.js
const VideoJS = lazy(() => import('./videojs'));

interface VideoPlayerProps {
  video: PlayableVideo;
}

const VideoPlayer = (props: VideoPlayerProps) => {
  const { video } = props;

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    aspectRatio: '16:9',
    html5: {
      vhs: {
        overrideNative: true,
      },
      nativeAudioTracks: false,
      nativeVideoTracks: false,
    },
  };

  return (
    <Box
      sx={theme => ({
        aspectRatio: '16/9',
        borderRadius: theme.shape.borderRadius / 12,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
      })}
    >
      <Suspense fallback={<div>Loading player...</div>}>
        <VideoJS video={video} videoJsOptions={videoJsOptions} />
      </Suspense>
    </Box>
  );
};

export { VideoPlayer, type VideoPlayerProps };
