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
  const subtitlesInitialized = useRef(false);

  // biome-ignore lint/suspicious/noExplicitAny: ReactPlayer passes an implementation-specific instance
  const setPlayerRef = useCallback((player: any) => {
    if (!player) return;

    playerRef.current = player;
  }, []);

  // Debug function to test VTT file accessibility (disabled by default to avoid extra requests)
  const testVttFile = useCallback(async (url: string, lang: string) => {
    // Uncomment for debugging VTT loading issues
    /*
    try {
      console.log(`Testing VTT file for ${lang}:`, url);
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`❌ VTT file fetch failed with status ${response.status}:`, url);
        return;
      }

      const text = await response.text();
      console.log(`✓ VTT file loaded successfully (${text.length} bytes):`, url);
      console.log('VTT content preview:', text.substring(0, 200));

      if (!text.startsWith('WEBVTT')) {
        console.error('❌ Invalid VTT file - does not start with WEBVTT:', text.substring(0, 50));
      } else {
        const cueCount = (text.match(/\d{1,2}:\d{2}[:.]\d{3}\s+-->\s+\d{1,2}:\d{2}[:.]\d{3}/g) || []).length;
        console.log(`✓ VTT file is valid, found ${cueCount} cues`);
      }
    } catch (error) {
      console.error('❌ Error testing VTT file:', error);
    }
    */
  }, []);

  // Force subtitle tracks to load and set the default track to 'showing' mode
  // This is a pure event-driven approach with no arbitrary timeouts
  const initializeSubtitleTracks = useCallback(() => {
    if (!playerRef.current || subtitlesInitialized.current) return;

    try {
      const internalPlayer = playerRef.current.getInternalPlayer();
      if (!internalPlayer || !internalPlayer.textTracks) return;

      const textTracks = internalPlayer.textTracks;

      // Process each text track
      for (let i = 0; i < textTracks.length; i++) {
        const track = textTracks[i];
        const trackElement = internalPlayer.querySelector(
          `track[srclang="${track.language}"]`
        ) as HTMLTrackElement;

        if (!trackElement) continue;

        // Find matching subtitle configuration
        const matchingSubtitle = subtitles?.find(
          (sub) => sub.lang === track.language
        );

        if (!matchingSubtitle) continue;

        // Listen for track errors
        trackElement.addEventListener(
          'error',
          () => {
            console.error('❌ Subtitle track error:', trackElement.error);
          },
          { once: true }
        );

        if (matchingSubtitle.isDefault) {
          // This is the default subtitle track we want to activate
          const activateTrack = () => {
            if (track.cues && track.cues.length > 0) {
              track.mode = 'showing';
              subtitlesInitialized.current = true;
              console.log('✓ Subtitles activated:', track.language, track.cues.length, 'cues');
            }
          };

          // Check if already loaded
          if (trackElement.readyState === 2 && track.cues && track.cues.length > 0) {
            // Already loaded and has cues - activate immediately
            activateTrack();
          } else {
            // Not loaded yet - set up event listeners
            track.mode = 'showing'; // Set to showing so browser will load it

            // Listen for track load event
            trackElement.addEventListener('load', activateTrack, { once: true });

            // Backup: listen for cuechange event
            track.addEventListener(
              'cuechange',
              () => {
                if (!subtitlesInitialized.current) {
                  activateTrack();
                }
              },
              { once: true }
            );
          }
        } else {
          // Not the default track - disable it
          track.mode = 'disabled';
        }
      }
    } catch (error) {
      console.error('Failed to initialize subtitle tracks:', error);
    }
  }, [subtitles]);

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
          handleSeek();
          break;

        case 'End': // Jump to end
          e.preventDefault();
          e.stopPropagation();
          if (duration) {
            player.seekTo(duration - 1, 'seconds');
            handleSeek();
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
            handleSeek();
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

  // No need for fallback - event listeners handle everything

  // Reset subtitle initialization when video changes
  useEffect(() => {
    subtitlesInitialized.current = false;
  }, [video.id, video.source]);

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
        borderRadius: theme.shape.borderRadius / 12,
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
          onPause={handlePause}
          onPlay={handlePlay}
          onSeek={handleSeek}
          onEnded={() => {
            handleEnded();
            onEnded?.();
          }}
          onReady={() => {
            initializeSubtitleTracks();
          }}
          progressInterval={PROGRESS_INTERVAL}
          config={{
            file: {
              attributes: {
                playsInline: true, // Important for iOS
                crossOrigin: 'anonymous', // Required for CORS subtitle loading
                preload: 'metadata', // Force browser to load subtitle tracks immediately
              },
              tracks: subtitles?.map((subtitle) => ({
                kind: 'subtitles',
                src: subtitle.src,
                srcLang: subtitle.lang,
                label: subtitle.label,
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
