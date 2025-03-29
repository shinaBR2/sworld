import { useEffect, useMemo, useRef } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import { useVideoProgress } from 'core/watch/mutation-hooks/use-video-progress';
import { useAuthContext } from 'core/providers/auth';
import { PlayableVideo } from '../types';
import 'videojs-youtube';
import { getVideoPlayerOptions } from './utils';

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
}

// Thanks to
// https://github.com/cadenzah/videojs-react-enhanced/blob/master/lib/utils/initializeEventListeners.ts
export const VideoJS = (props: VideoJSProps) => {
  const videoRef = useRef(null);
  const playerRef = useRef<Player | null>(null);
  const { video, videoJsOptions } = props;

  // This is IMPORTANT to memoize the options object
  // Otherwise, the player will be reinitialized on every render
  const options = useMemo(
    () =>
      getVideoPlayerOptions(video, {
        ...videoJsOptions,
      }),
    [video, JSON.stringify(videoJsOptions)]
  );

  const { getAccessToken } = useAuthContext();
  const { handleProgress, handlePlay, handlePause, handleSeek, handleEnded, cleanup } = useVideoProgress({
    videoId: video.id,
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
        player.on('ended', handleEnded);
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
  }, [options]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    import(/* webpackChunkName: "videojs-styles" */ 'video.js/dist/video-js.css' as string);
  }, []);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoJS;
