import { useEffect, useMemo, useRef } from 'react';
import videojs from 'video.js';
import '@videojs/http-streaming';
import type Player from 'video.js/dist/types/player';
import { useVideoProgress } from 'core/watch/mutation-hooks/use-video-progress';
import { useAuthContext } from 'core/providers/auth';
import { PlayableVideo } from '../types';
import { getVideoPlayerOptions } from './utils';
import 'video.js/dist/video-js.css';

/**
 * videojs has no exported type
 */
interface VideoJsOptions {
  autoplay?: boolean;
  controls?: boolean;
  fluid?: boolean;
  responsive?: boolean;
  sources?: {
    src: string;
    type: string;
  }[];
  tracks?: {
    kind: 'captions' | 'subtitles' | 'chapters' | 'descriptions' | 'metadata';
    src: string;
    srclang?: string;
    label?: string;
    default?: boolean;
  }[];
  [key: string]: any;
}

interface VideoJSProps {
  video: PlayableVideo;
  videoJsOptions: VideoJsOptions;
  onEnded?: () => void;
  onError?: (error: unknown) => void; // TODO handle error
}

const debugLog = (message: string, data?: any) => {
  console.log(`[VideoJS Debug] ${message}`, data || '');
};

// Thanks to
// https://github.com/cadenzah/videojs-react-enhanced/blob/master/lib/utils/initializeEventListeners.ts
export const VideoJS = (props: VideoJSProps) => {
  const videoRef = useRef(null);
  const playerRef = useRef<Player | null>(null);
  const { video, videoJsOptions, onEnded } = props;

  // This is IMPORTANT to memoize the options object
  // Otherwise, the player will be reinitialized on every render
  const options = useMemo(
    () =>
      getVideoPlayerOptions(video, {
        ...videoJsOptions,
      }),
    [video.source, JSON.stringify(videoJsOptions)]
  );

  const { isSignedIn, getAccessToken } = useAuthContext();
  const { handleProgress, handlePlay, handlePause, handleSeek, handleEnded, cleanup } = useVideoProgress({
    videoId: video.id,
    isSignedIn,
    getAccessToken,
    // onError,
  });

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement('video-js');

      videoElement.classList.add('vjs-big-play-centered');
      (videoRef.current as HTMLDivElement).appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        let lastUpdateSeconds = -1;

        player.on('play', () => {
          handlePlay();
        });

        player.on('timeupdate', () => {
          const playedSeconds = Math.floor(player.currentTime() as number);

          /**
           * This is a throttle to prevent too many requests
           * It use Math.floor() to make sure we only update once per second
           * The default value is -1 to make sure we update on the first second
           */
          if (playedSeconds > lastUpdateSeconds) {
            lastUpdateSeconds = playedSeconds;

            if (handleProgress) {
              handleProgress({ playedSeconds });
            }
          }
        });

        player.on('seeked', () => {
          const seconds = Math.floor(player.currentTime() as number);
          handleSeek(seconds);
        });

        player.on('pause', handlePause);
        player.on('ended', () => {
          handleEnded();
          onEnded?.();
        });

        debugLog('Player ready state:', {
          readyState: player.readyState(),
          paused: player.paused(),
          muted: player.muted(),
          volume: player.volume(),
          duration: player.duration(),
          currentTime: player.currentTime(),
        });

        // Debug HLS/VHS info
        setTimeout(() => {
          try {
            // @ts-ignore - accessing internal VHS properties
            const vhs = player.tech()?.vhs;
            if (vhs) {
              debugLog('VHS/HLS info:', {
                version: vhs.version,
                stats: vhs.stats,
                playlists: vhs.playlists,
              });
            } else {
              debugLog('No VHS found - using native HLS or different tech');
            }
          } catch (e) {
            debugLog('Error accessing VHS info:', e);
          }
        }, 1000);

        // Audio tracks debugging
        player.on('loadedmetadata', () => {
          debugLog('Metadata loaded');

          // @ts-ignore
          const audioTracks = player.audioTracks();
          // @ts-ignore
          const videoTracks = player.videoTracks();

          debugLog('Audio tracks info:', {
            count: audioTracks.length,
            tracks: Array.from({ length: audioTracks.length }, (_, i) => ({
              index: i,
              enabled: audioTracks[i].enabled,
              kind: audioTracks[i].kind,
              label: audioTracks[i].label,
              language: audioTracks[i].language,
            })),
          });

          debugLog('Video tracks info:', {
            count: videoTracks.length,
            tracks: Array.from({ length: videoTracks.length }, (_, i) => ({
              index: i,
              selected: videoTracks[i].selected,
              kind: videoTracks[i].kind,
              label: videoTracks[i].label,
            })),
          });
        });

        // Debug all player events
        const debugEvents = [
          'loadstart',
          'loadeddata',
          'canplay',
          'canplaythrough',
          'playing',
          'waiting',
          'seeking',
          'seeked',
          'ended',
          'error',
          'abort',
          'emptied',
          'stalled',
          'suspend',
          'volumechange',
          'ratechange',
        ];

        debugEvents.forEach(eventName => {
          player.on(eventName, () => {
            debugLog(`Event: ${eventName}`, {
              currentTime: player.currentTime(),
              duration: player.duration(),
              paused: player.paused(),
              muted: player.muted(),
              volume: player.volume(),
              readyState: player.readyState(),
            });
          });
        });

        // Error handling with detailed logging
        player.on('error', (error: any) => {
          const playerError = player.error();
          debugLog('Player error occurred:', {
            error,
            playerError,
            code: playerError?.code,
            message: playerError?.message,
            // @ts-ignore
            type: playerError?.type,
          });
        });
      }));
    } else {
      const player = playerRef.current;

      if (player) {
        player.autoplay((options as VideoJsOptions).autoplay);
        player.src(options.sources);
      }
    }

    return () => {
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [video.id]);
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    import(/* webpackChunkName: "videojs-youtube" */ 'videojs-youtube' as string);
  }, []);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoJS;
