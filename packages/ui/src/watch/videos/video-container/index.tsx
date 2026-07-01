import type { MutableRefObject } from 'react';
import type { PlayableVideo } from '../types';
import { VideoPlayer } from '../video-player';

interface VideoContainerInterface {
  video: PlayableVideo;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  onPausedChange?: (isPaused: boolean) => void;
  getCurrentTimeRef?: MutableRefObject<(() => number | null) | null>;
  getVideoElementRef?: MutableRefObject<(() => HTMLVideoElement | null) | null>;
}

const VideoContainer = (props: VideoContainerInterface) => {
  const {
    video,
    onEnded,
    onError,
    onPausedChange,
    getCurrentTimeRef,
    getVideoElementRef,
  } = props;

  return (
    <VideoPlayer
      video={video}
      onEnded={onEnded}
      onError={onError}
      onPausedChange={onPausedChange}
      getCurrentTimeRef={getCurrentTimeRef}
      getVideoElementRef={getVideoElementRef}
    />
  );
};

export { VideoContainer };
