import { lazy, Suspense } from 'react';
import Box from '@mui/material/Box';
import { PlayableVideo } from '../types';

// Lazy load the VideoJS component that contains video.js
const VideoJS = lazy(() => import('./videojs'));

interface VideoPlayerProps {
  video: PlayableVideo;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
}

const VideoPlayer = (props: VideoPlayerProps) => {
  const { video, onEnded, onError } = props;

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
    userActions: {
      hotkeys: function (event: KeyboardEvent) {
        const player = this; // Get player instance
        const key = event.which;

        // Space/K for play/pause
        if (key === 32 || key === 75) {
          // 32=Space, 75=K
          event.preventDefault();
          // @ts-ignore
          player.paused() ? player.play() : player.pause();
          return true;
        }

        // M for mute
        if (key === 77) {
          // 77=M
          event.preventDefault();
          // @ts-ignore
          player.muted(!player.muted());
          return true;
        }

        // Left/Right arrows for 5s seek
        if (key === 37) {
          // Left arrow
          event.preventDefault();
          // @ts-ignore
          player.currentTime(player.currentTime() - 5);
          return true;
        }
        if (key === 39) {
          // Right arrow
          event.preventDefault();
          // @ts-ignore
          player.currentTime(player.currentTime() + 5);
          return true;
        }

        // Keep existing fullscreen override
        if (key === 70) {
          // f
          event.preventDefault();
          // @ts-ignore
          player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
          return true;
        }
      },
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
        <VideoJS video={video} videoJsOptions={videoJsOptions} onEnded={onEnded} onError={onError} />
      </Suspense>
    </Box>
  );
};

export { VideoPlayer, type VideoPlayerProps };
