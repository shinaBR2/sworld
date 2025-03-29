import { PlayableVideo } from '../types';
import { VideoPlayer } from '../video-player';

interface VideoContainerInterface {
  video: PlayableVideo;
  onError: (error: unknown) => void;
}

const VideoContainer = (props: VideoContainerInterface) => {
  const { video } = props;

  return <VideoPlayer video={video} />;
};

export { VideoContainer };
