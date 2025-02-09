import { Suspense, useRef, useCallback } from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import { Video } from '../interface';
import { VideoThumbnail } from '../video-thumbnail';
import Box from '@mui/material/Box';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  video: Video;
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

interface PlayerRef {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (amount: number, type?: 'seconds' | 'fraction') => void;
}

const VideoPlayer = ({
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
}: VideoPlayerProps) => {
  const { title, source, thumbnailUrl } = video;
  const playerRef = useRef<PlayerRef>(null);

  const handleError = useCallback(
    (error: unknown) => {
      console.error('ReactPlayer Error:', error);
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
        })}
      >
        <ReactPlayer
          ref={playerRef}
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
          progressInterval={1000} // Update progress every second
        />
      </Box>
    </Suspense>
  );
};

export { VideoPlayer, type VideoPlayerProps, type PlayerRef };
