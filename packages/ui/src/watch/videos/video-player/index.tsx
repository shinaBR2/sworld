import Box from '@mui/material/Box';
import { useAuthContext } from 'core/providers/auth';
import { useVideoProgress } from 'core/watch/mutation-hooks/use-video-progress';
import {
  lazy,
  type MutableRefObject,
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

// Rewind a few seconds from the saved position so the viewer gets a moment of
// context when resuming rather than landing mid-sentence.
const RESUME_REWIND_SECONDS = 5;

// If the saved position is within this many seconds of the end, treat the video
// as finished and start from the beginning instead of resuming at the very end.
const RESUME_END_THRESHOLD_SECONDS = 10;

// Lazy load the VideoJS component that contains video.js
// const VideoJS = lazy(() => import('./videojs'));
// react-player is CJS; rolldown-vite's prebundle exposes its exports object as
// the ESM default instead of unwrapping `.default`, so unwrap both shapes here.
const ReactPlayer = lazy(async () => {
  const mod = await import('react-player');
  const unwrapped = (mod.default as unknown as { default?: typeof mod.default })
    .default;
  return { default: unwrapped ?? mod.default };
});

interface VideoPlayerProps {
  video: PlayableVideo;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  // Notifies the parent whenever the player is paused/resumed so owner-only
  // controls (e.g. "Set as thumbnail") can react to the paused state.
  onPausedChange?: (isPaused: boolean) => void;
  // A ref the player fills with a getter for the current playback time in
  // seconds, letting the parent read the paused frame without owning the
  // player instance.
  getCurrentTimeRef?: MutableRefObject<(() => number | null) | null>;
  // A ref the player fills with a getter for the underlying <video> element, so
  // the parent can capture the current frame client-side (thumbnail capture)
  // without owning the player instance.
  getVideoElementRef?: MutableRefObject<(() => HTMLVideoElement | null) | null>;
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
  const {
    video,
    onEnded,
    onError,
    onPausedChange,
    getCurrentTimeRef,
    getVideoElementRef,
  } = props;
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
  // Resume only once per video, and never override a position the viewer has
  // since changed themselves.
  const hasResumedRef = useRef(false);

  // Reset the resume guard whenever the source video changes (e.g. advancing to
  // the next video in a playlist reuses this same player instance).
  // biome-ignore lint/correctness/useExhaustiveDependencies: video.id is the intended reset trigger, not a value read in the body
  useEffect(() => {
    hasResumedRef.current = false;
  }, [video.id]);

  const setPlayerRef = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: ReactPlayer passes an implementation-specific instance
    (player: any) => {
      if (!player) return;

      playerRef.current = player;

      // Expose a current-time getter to the parent so it can read the paused
      // frame's timestamp without holding the player instance itself.
      if (getCurrentTimeRef) {
        getCurrentTimeRef.current = () =>
          playerRef.current?.getCurrentTime?.() ?? null;
      }

      // Expose the underlying <video> element (the file player's internal
      // player) so the parent can draw the current frame to a canvas for
      // client-side thumbnail capture.
      if (getVideoElementRef) {
        getVideoElementRef.current = () => {
          const internal = playerRef.current?.getInternalPlayer?.();
          return internal instanceof HTMLVideoElement ? internal : null;
        };
      }
    },
    [getCurrentTimeRef, getVideoElementRef],
  );

  // Wrap the progress-tracking pause/play handlers so the parent also learns
  // about the paused state (native controls fire onPause/onPlay directly).
  const handlePauseWithNotify = useCallback(() => {
    handlePause();
    onPausedChange?.(true);
  }, [handlePause, onPausedChange]);

  const handlePlayWithNotify = useCallback(() => {
    handlePlay();
    onPausedChange?.(false);
  }, [handlePlay, onPausedChange]);

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
          e.stopPropagation();
          // Just toggle playing state - ReactPlayer's onPlay/onPause will handle side effects
          setPlayerState((prev) => ({ ...prev, playing: !prev.playing }));
          break;

        case 'm': // Toggle mute
          e.preventDefault();
          e.stopPropagation();
          setPlayerState((prev) => ({ ...prev, muted: !prev.muted }));
          break;

        case 'ArrowLeft': // Seek back 5s
          e.preventDefault();
          e.stopPropagation();
          if (currentTime !== null) {
            const newTime = Math.max(0, currentTime - 5);
            player.seekTo(newTime, 'seconds');
            handleSeek(newTime);
          }
          break;

        case 'ArrowRight': // Seek forward 5s
          e.preventDefault();
          e.stopPropagation();
          if (currentTime !== null && duration) {
            const newTime = Math.min(duration, currentTime + 5);
            player.seekTo(newTime, 'seconds');
            handleSeek(newTime);
          }
          break;

        case 'j': // Seek back 10s (YouTube style)
          e.preventDefault();
          e.stopPropagation();
          if (currentTime !== null) {
            const newTime = Math.max(0, currentTime - 10);
            player.seekTo(newTime, 'seconds');
            handleSeek(newTime);
          }
          break;

        case 'l': // Seek forward 10s (YouTube style)
          e.preventDefault();
          e.stopPropagation();
          if (currentTime !== null && duration) {
            const newTime = Math.min(duration, currentTime + 10);
            player.seekTo(newTime, 'seconds');
            handleSeek(newTime);
          }
          break;

        case 'ArrowUp': // Volume up
          e.preventDefault();
          e.stopPropagation();
          setPlayerState((prev) => ({
            ...prev,
            volume: Math.min(1, prev.volume + 0.05),
          }));
          break;

        case 'ArrowDown': // Volume down
          e.preventDefault();
          e.stopPropagation();
          setPlayerState((prev) => ({
            ...prev,
            volume: Math.max(0, prev.volume - 0.05),
          }));
          break;

        case 'f': // Fullscreen
          e.preventDefault();
          e.stopPropagation();
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
          e.stopPropagation();
          player.seekTo(0, 'seconds');
          handleSeek(0);
          break;

        case 'End': // Jump to end
          e.preventDefault();
          e.stopPropagation();
          if (duration) {
            player.seekTo(duration - 1, 'seconds');
            handleSeek(duration - 1);
          }
          break;

        case '>': // Increase playback speed
        case '.': // Also works with period key
          if (e.shiftKey || e.key === '>') {
            e.preventDefault();
            e.stopPropagation();
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
            e.stopPropagation();
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
          e.stopPropagation();
          if (duration) {
            const percentage = Number.parseInt(e.key, 10) / 10;
            const newTime = duration * percentage;
            player.seekTo(newTime, 'seconds');
            handleSeek(newTime);
          }
          break;

        default:
          break;
      }
    };

    // Fullscreen change handler - add document-level listener in fullscreen
    const handleFullscreenChange = () => {
      if (document.fullscreenElement === wrapper) {
        // Entering fullscreen - add document-level listener for global shortcuts
        document.addEventListener('keydown', handleKeyDown, { capture: true });
      } else {
        // Exiting fullscreen - remove document-level listener
        document.removeEventListener('keydown', handleKeyDown, {
          capture: true,
        });
      }
    };

    // Listen on the wrapper element in capture phase
    // This intercepts events before they reach the video element
    wrapper.addEventListener('keydown', handleKeyDown, { capture: true });

    // Listen for fullscreen changes to enable/disable document-level shortcuts
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      wrapper.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      // Cleanup document listener if still attached (in case component unmounts while in fullscreen)
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handleSeek]);

  const handleError = useCallback(
    (error: unknown) => {
      onError?.(error);
    },
    [onError],
  );

  // Resume from the saved position once the media is ready to seek.
  const handleReady = useCallback(() => {
    const player = playerRef.current;
    if (!player || hasResumedRef.current) return;
    hasResumedRef.current = true;

    const progressSeconds = video.progressSeconds ?? 0;
    if (progressSeconds <= 0) return;

    // Skip resuming when the saved position is at/near the end — the viewer has
    // effectively finished, so start over rather than land on the last frame.
    const duration = player.getDuration?.() ?? 0;
    if (
      duration &&
      progressSeconds >= duration - RESUME_END_THRESHOLD_SECONDS
    ) {
      return;
    }

    player.seekTo(
      Math.max(0, progressSeconds - RESUME_REWIND_SECONDS),
      'seconds',
    );
  }, [video.progressSeconds]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <Box
      ref={wrapperRef}
      tabIndex={0}
      data-testid="video-player-wrapper"
      sx={(theme) => ({
        aspectRatio: '16/9',
        borderRadius: Number(theme.shape.borderRadius) / 12,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        // Visible focus indicator for accessibility
        '&:focus': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
        '&:focus:not(:focus-visible)': {
          outline: 'none', // Hide outline for mouse clicks
        },
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
          onPause={handlePauseWithNotify}
          onPlay={handlePlayWithNotify}
          onSeek={handleSeek}
          onEnded={() => {
            handleEnded();
            onPausedChange?.(false);
            onEnded?.();
          }}
          onReady={handleReady}
          progressInterval={PROGRESS_INTERVAL}
          config={{
            file: {
              // react-player defaults to hls.js 1.1.4, which mis-builds the AAC
              // decoder config for some MPEG-TS streams (Chrome media-internals
              // shows `profile: unknown` / `Unknown sample format`), producing
              // intermittent noise/garbled audio on desktop (hls.js path only;
              // iOS/native is unaffected). Pin a current hls.js that fixes it.
              // See video-dev/hls.js#5251.
              hlsVersion: '1.5.20',
              attributes: {
                playsInline: true, // Important for iOS
                // `anonymous` loads the media without credentials but *with*
                // CORS, so drawing a frame to a canvas doesn't taint it. This
                // plus permissive GET CORS headers on the video bucket is
                // required for client-side thumbnail capture.
                crossOrigin: 'anonymous',
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
