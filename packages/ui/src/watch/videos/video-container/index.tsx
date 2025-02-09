import { Auth, watchMutationHooks } from 'core';
import { Video } from '../interface';
import { useEffect } from 'react';
import { VideoPlayer } from '../video-player';

interface VideoContainerInterface {
  video: Video;
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
