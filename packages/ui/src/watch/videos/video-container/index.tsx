import { PlayableVideo } from '../types';
import { VideoPlayer } from '../video-player';

interface VideoContainerInterface {
  video: PlayableVideo;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
}

const VideoContainer = (props: VideoContainerInterface) => {
  const { video, onEnded, onError } = props;

  return <VideoPlayer video={video} onEnded={onEnded} onError={onError} />;
};

export { VideoContainer };
