// import { lazy } from 'react';
import Box from '@mui/material/Box';
import { PlayableVideo } from '../types';
import 'video.js/dist/video-js.css';
import VideoJS from './videojs';
// import { VideoPlayer as VideoJSReact } from '@videojs-player/react';

interface VideoPlayerProps {
  video: PlayableVideo;
}

// const PROGRESS_INTERVAL = 1000;

// const ReactPlayer = lazy(() => import('react-player'));

// const VideoPlayer = (props: VideoPlayerProps) => {
//   const {
//     video,
//     onProgress,
//     onPause,
//     onPlay,
//     onSeek,
//     onEnded,
//     onError,
//     onReady,
//     controls = true,
//     playing = false,
//     muted = false,
//     volume = 1,
//     playbackRate = 1,
//   } = props;
//   const { title, source, thumbnailUrl } = video;

//   const handleError = useCallback(
//     (error: unknown) => {
//       onError?.(error);
//     },
//     [onError]
//   );

//   return (
//     <Suspense fallback={<VideoThumbnail title={title} />}>
//       <Box
//         sx={theme => ({
//           aspectRatio: '16/9',
//           borderRadius: theme.shape.borderRadius / 12,
//           overflow: 'hidden',
//           width: '100%',
//           height: '100%',
//         })}
//       >
//         <ReactPlayer
//           url={source}
//           controls={controls}
//           width="100%"
//           height="100%"
//           light={thumbnailUrl ?? defaultThumbnailUrl}
//           playing={playing}
//           muted={muted}
//           volume={volume}
//           playbackRate={playbackRate}
//           onError={handleError}
//           onProgress={onProgress}
//           onPause={onPause}
//           onPlay={onPlay}
//           onSeek={onSeek}
//           onEnded={onEnded}
//           onReady={onReady}
//           progressInterval={PROGRESS_INTERVAL}
//           config={{
//             file: {
//               attributes: {
//                 playsInline: true, // Important for iOS
//               },
//             },
//           }}
//         />
//       </Box>
//     </Suspense>
//   );
// };

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

  console.log(`video player rerendered`);

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
