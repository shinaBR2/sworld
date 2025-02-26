import { Auth, watchMutationHooks } from 'core';
import { useEffect } from 'react';
import { VideoPlayer } from '../video-player';
import { PlayableVideo } from '../types';

interface VideoContainerInterface {
  video: PlayableVideo;
  onError: (error: unknown) => void;
}

const { useVideoProgress } = watchMutationHooks;

const VideoContainer = (props: VideoContainerInterface) => {
  const { video, onError } = props;
  const { getAccessToken } = Auth.useAuthContext();
  const { handleProgress, handlePlay, handlePause, handleSeek, handleEnded, cleanup } = useVideoProgress({
    videoId: video.id,
    getAccessToken,
    onError,
  });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <VideoPlayer
      video={video}
      onProgress={handleProgress}
      onPlay={handlePlay}
      onPause={handlePause}
      onSeek={handleSeek}
      onEnded={handleEnded}
      onError={error => {
        console.error('Player error:', error);
        onError?.(error as Error);
      }}
    />
  );
};

export { VideoContainer };
