import { Suspense, useCallback, lazy } from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import { VideoThumbnail } from '../video-thumbnail';
import Box from '@mui/material/Box';
import { PlayableVideo } from '../types';

interface VideoPlayerProps {
  video: PlayableVideo;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onPause?: () => void;
  onPlay?: () => void;
  onSeek?: (seconds: number) => void;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  onReady?: () => void;
  controls?: boolean;
  playing?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: number;
}

const PROGRESS_INTERVAL = 1000;

const ReactPlayer = lazy(() => import('react-player'));

const VideoPlayer = (props: VideoPlayerProps) => {
  const {
    video,
    onProgress,
    onPause,
    onPlay,
    onSeek,
    onEnded,
    onError,
    onReady,
    controls = true,
    playing = false,
    muted = false,
    volume = 1,
    playbackRate = 1,
  } = props;
  const { title, source, thumbnailUrl } = video;

  const handleError = useCallback(
    (error: unknown) => {
      onError?.(error);
    },
    [onError]
  );

  return (
    <Suspense fallback={<VideoThumbnail title={title} />}>
      <Box
        sx={theme => ({
          aspectRatio: '16/9',
          borderRadius: theme.shape.borderRadius / 12,
          overflow: 'hidden',
          width: '100%',
          height: '100%',
        })}
      >
        <ReactPlayer
          url={source}
          controls={controls}
          width="100%"
          height="100%"
          light={thumbnailUrl ?? defaultThumbnailUrl}
          playing={playing}
          muted={muted}
          volume={volume}
          playbackRate={playbackRate}
          onError={handleError}
          onProgress={onProgress}
          onPause={onPause}
          onPlay={onPlay}
          onSeek={onSeek}
          onEnded={onEnded}
          onReady={onReady}
          progressInterval={PROGRESS_INTERVAL}
          config={{
            file: {
              attributes: {
                playsInline: true, // Important for iOS
              },
            },
          }}
        />
      </Box>
    </Suspense>
  );
};

export { VideoPlayer, type VideoPlayerProps };
