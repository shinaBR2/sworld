import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
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

  // Player state
  const [playerState, setPlayerState] = useState({
    playing: false,
    volume: 1,
    muted: false,
    playbackRate: 1.0,
  });

  // Ref to the player element
  // to control the player and handle hotkeys
  const playerRef = useRef<any | null>(null);
  const setPlayerRef = useCallback((player: any) => {
    if (!player) return;

    playerRef.current = player;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in inputs (just like YouTube)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const player = playerRef.current;
      if (!player) return;

      switch (e.key) {
        case 'k': // Play/pause
          e.preventDefault();
          if (player.paused) {
            setPlayerState(prev => ({ ...prev, playing: !prev.playing }));
            handlePlay();
          } else {
            setPlayerState(prev => ({ ...prev, playing: !prev.playing }));
            handlePause();
          }
          break;

        case 'm': // Toggle mute
          e.preventDefault();
          setPlayerState(prev => ({ ...prev, muted: !prev.muted }));
          break;

        // case 'ArrowLeft': // Seek back 5s
        //   e.preventDefault();
        //   e.stopPropagation();
        //   setPlayerState(prev => ({ ...prev, seeking: true }));
        //   player.currentTime = Math.max(0, player.currentTime - 5);
        //   break;

        // case 'ArrowRight': // Seek forward 5s
        //   e.preventDefault();
        //   e.stopPropagation();

        //   console.log('ArrowRight', player.getCurrentTime(), player.currentTime);

        //   setPlayerState(prev => ({ ...prev, seeking: true }));
        //   player.currentTime = Math.min(player.duration, player.getCurrentTime() + 5);
        //   break;

        case 'ArrowUp': // Volume up
          e.preventDefault();
          setPlayerState(prev => ({ ...prev, volume: Math.min(1, prev.volume + 0.05) }));
          break;

        case 'ArrowDown': // Volume down
          e.preventDefault();
          setPlayerState(prev => ({ ...prev, volume: Math.max(0, prev.volume - 0.05) }));
          break;

        case 'f': // Fullscreen
          e.preventDefault();
          if (player.requestFullscreen) {
            player.requestFullscreen();
          }
          break;

        default:
          break;
      }
    };

    // Listen on document (just like YouTube)
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
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
          ref={setPlayerRef}
          url={source}
          controls={true}
          width="100%"
          height="100%"
          light={thumbnailUrl ?? defaultThumbnailUrl}
          playing={playerState.playing}
          muted={playerState.muted}
          volume={playerState.volume}
          playbackRate={playerState.playbackRate}
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
