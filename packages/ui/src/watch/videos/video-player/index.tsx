import { lazy, Suspense, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import { PlayableVideo } from '../types';
import { useAuthContext } from 'core/providers/auth';
import { useVideoProgress } from 'core/watch/mutation-hooks/use-video-progress';
import { VideoThumbnail } from '../video-thumbnail';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';

const PROGRESS_INTERVAL = 1000;

// Lazy load the VideoJS component that contains video.js
// const VideoJS = lazy(() => import('./videojs'));
const ReactPlayer = lazy(() => import('react-player'));

interface VideoPlayerProps {
  video: PlayableVideo;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
}

const VideoPlayer = (props: VideoPlayerProps) => {
  const { video, onEnded, onError } = props;
  const { title, source, thumbnailUrl, subtitles } = video;
  const { isSignedIn, getAccessToken } = useAuthContext();
  const { handleProgress, handlePlay, handlePause, handleSeek, handleEnded, cleanup } = useVideoProgress({
    videoId: video.id,
    isSignedIn,
    getAccessToken,
    // onError,
  });

  console.log(`subtitles`, subtitles, video);

  const handleError = useCallback(
    (error: unknown) => {
      console.log(`errorr`, error);
      onError?.(error);
    },
    [onError]
  );

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
      <Suspense fallback={<VideoThumbnail title={title} />}>
        <ReactPlayer
          url={source}
          controls={true}
          width="100%"
          height="100%"
          light={thumbnailUrl ?? defaultThumbnailUrl}
          playing={false}
          muted={false}
          volume={1}
          playbackRate={1}
          onError={handleError}
          onProgress={handleProgress}
          onPause={handlePause}
          onPlay={handlePlay}
          onSeek={handleSeek}
          onEnded={() => {
            handleEnded();
            onEnded?.();
          }}
          onReady={() => {
            console.log('player ready');
          }}
          progressInterval={PROGRESS_INTERVAL}
          config={{
            file: {
              attributes: {
                playsInline: true, // Important for iOS
                crossOrigin: 'true',
              },
              tracks: subtitles?.map(subtitle => ({
                kind: 'subtitles',
                src: subtitle.src,
                srcLang: subtitle.lang,
                default: subtitle.isDefault,
              })),
            },
          }}
        />
      </Suspense>
    </Box>
  );
};

export { VideoPlayer, type VideoPlayerProps };
