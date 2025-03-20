import { VideoPlayer } from '../video-player';
import { PlayableVideo } from '../types';

interface VideoContainerInterface {
  video: PlayableVideo;
  onError: (error: unknown) => void;
}

const VideoContainer = (props: VideoContainerInterface) => {
  const { video } = props;

  return <VideoPlayer video={video} />;
};

export { VideoContainer };
