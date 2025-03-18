import Box from '@mui/material/Box';
import { PlayableVideo } from '../types';
import 'video.js/dist/video-js.css';
import VideoJS from './videojs';

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
      <VideoJS video={video} videoJsOptions={videoJsOptions} />
    </Box>
  );
};

export { VideoPlayer, type VideoPlayerProps };
