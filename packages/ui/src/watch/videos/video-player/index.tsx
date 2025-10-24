import Box from '@mui/material/Box';
import { useAuthContext } from 'core/providers/auth';
import { useVideoProgress } from 'core/watch/mutation-hooks/use-video-progress';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import type { PlayableVideo } from '../types';
import { VideoThumbnail } from '../video-thumbnail';

const PROGRESS_INTERVAL = 1000;

// Lazy load the VideoJS component that contains video.js
// const VideoJS = lazy(() => import('./videojs'));
const ReactPlayer = lazy(() => import('react-player'));

interface VideoPlayerProps {
  video: PlayableVideo;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Video Player Component with comprehensive keyboard shortcuts
 *
 * Available Hotkeys:
 * - Space / K: Play/Pause toggle
 * - M: Toggle mute
 * - F: Toggle fullscreen
 * - Arrow Left: Seek backward 5 seconds
 * - Arrow Right: Seek forward 5 seconds
 * - J: Seek backward 10 seconds (YouTube style)
 * - L: Seek forward 10 seconds (YouTube style)
 * - Arrow Up: Increase volume by 5%
 * - Arrow Down: Decrease volume by 5%
 * - 0-9: Jump to 0-90% of video (0=start, 5=50%, 9=90%)
 * - Home: Jump to beginning
 * - End: Jump to end
 * - > (Shift + .): Increase playback speed by 0.25x
 * - < (Shift + ,): Decrease playback speed by 0.25x
 *
 * Note: Hotkeys are disabled when typing in input fields
 */

const VideoPlayer = (props: VideoPlayerProps) => {
  const { video, onEnded, onError } = props;
  const { title, source, thumbnailUrl, subtitles } = video;
  const { isSignedIn, getAccessToken } = useAuthContext();
  const {
    handleProgress,
    handlePlay,
    handlePause,
    handleSeek,
    handleEnded,
    cleanup,
  } = useVideoProgress({
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
  // biome-ignore lint/suspicious/noExplicitAny: ref type depends on ReactPlayer internals
  const playerRef = useRef<any | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // biome-ignore lint/suspicious/noExplicitAny: ReactPlayer passes an implementation-specific instance
  const setPlayerRef = useCallback((player: any) => {
    if (!player) return;

    playerRef.current = player;
  }, []);

  // Handle keyboard shortcuts on the wrapper element
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in inputs (just like YouTube)
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const player = playerRef.current;
      if (!player) return;

      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();

      switch (e.key) {
        case ' ': // Space - Play/pause
        case 'k': // K - Play/pause (YouTube style)
          e.preventDefault();
          e.stopImmediatePropagation();
          setPlayerState((prev) => {
            const newPlaying = !prev.playing;
            if (newPlaying) {
              handlePlay();
            } else {
              handlePause();
            }
            return { ...prev, playing: newPlaying };
          });
          break;

        case 'm': // Toggle mute
          e.preventDefault();
          e.stopImmediatePropagation();
          setPlayerState((prev) => ({ ...prev, muted: !prev.muted }));
          break;

        case 'ArrowLeft': // Seek back 5s
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (currentTime !== null) {
            const newTime = Math.max(0, currentTime - 5);
            player.seekTo(newTime, 'seconds');
            handleSeek();
          }
          break;

        case 'ArrowRight': // Seek forward 5s
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (currentTime !== null && duration) {
            const newTime = Math.min(duration, currentTime + 5);
            player.seekTo(newTime, 'seconds');
            handleSeek();
          }
          break;

        case 'j': // Seek back 10s (YouTube style)
          e.preventDefault();
          e.stopImmediatePropagation();
          if (currentTime !== null) {
            const newTime = Math.max(0, currentTime - 10);
            player.seekTo(newTime, 'seconds');
            handleSeek();
          }
          break;

        case 'l': // Seek forward 10s (YouTube style)
          e.preventDefault();
          e.stopImmediatePropagation();
          if (currentTime !== null && duration) {
            const newTime = Math.min(duration, currentTime + 10);
            player.seekTo(newTime, 'seconds');
            handleSeek();
          }
          break;

        case 'ArrowUp': // Volume up
          e.preventDefault();
          e.stopImmediatePropagation();
          setPlayerState((prev) => ({
            ...prev,
            volume: Math.min(1, prev.volume + 0.05),
          }));
          break;

        case 'ArrowDown': // Volume down
          e.preventDefault();
          e.stopImmediatePropagation();
          setPlayerState((prev) => ({
            ...prev,
            volume: Math.max(0, prev.volume - 0.05),
          }));
          break;

        case 'f': // Fullscreen
          e.preventDefault();
          e.stopImmediatePropagation();
          // Get the wrapper element for fullscreen
          if (wrapper) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else if (wrapper.requestFullscreen) {
              wrapper.requestFullscreen();
            }
          }
          break;

        case 'Home': // Jump to start
          e.preventDefault();
          e.stopImmediatePropagation();
          player.seekTo(0, 'seconds');
          handleSeek();
          break;

        case 'End': // Jump to end
          e.preventDefault();
          e.stopImmediatePropagation();
          if (duration) {
            player.seekTo(duration - 1, 'seconds');
            handleSeek();
          }
          break;

        case '>': // Increase playback speed
        case '.': // Also works with period key
          if (e.shiftKey || e.key === '>') {
            e.preventDefault();
            e.stopImmediatePropagation();
            setPlayerState((prev) => ({
              ...prev,
              playbackRate: Math.min(2, prev.playbackRate + 0.25),
            }));
          }
          break;

        case '<': // Decrease playback speed
        case ',': // Also works with comma key
          if (e.shiftKey || e.key === '<') {
            e.preventDefault();
            e.stopImmediatePropagation();
            setPlayerState((prev) => ({
              ...prev,
              playbackRate: Math.max(0.25, prev.playbackRate - 0.25),
            }));
          }
          break;

        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          // Jump to percentage of video (0 = 0%, 1 = 10%, 2 = 20%, etc.)
          e.preventDefault();
          e.stopImmediatePropagation();
          if (duration) {
            const percentage = Number.parseInt(e.key, 10) / 10;
            const newTime = duration * percentage;
            player.seekTo(newTime, 'seconds');
            handleSeek();
          }
          break;

        default:
          break;
      }
    };

    // Focus the wrapper so it can receive keyboard events
    wrapper.setAttribute('tabindex', '0');
    wrapper.focus();

    // Listen on the wrapper element in capture phase
    // This intercepts events before they reach the video element
    wrapper.addEventListener('keydown', handleKeyDown, { capture: true });

    // Also listen on document as fallback for global shortcuts
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      wrapper.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handlePlay, handlePause, handleSeek]);

  const handleError = useCallback(
    (error: unknown) => {
      onError?.(error);
    },
    [onError],
  );

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <Box
      ref={wrapperRef}
      sx={(theme) => ({
        aspectRatio: '16/9',
        borderRadius: theme.shape.borderRadius / 12,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        outline: 'none', // Remove focus outline
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
              tracks: subtitles?.map((subtitle) => ({
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
