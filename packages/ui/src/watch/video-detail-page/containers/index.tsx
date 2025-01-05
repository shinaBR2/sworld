import { useIsMobile } from '../../../universal/responsive';
import { VideoDetailContainerProps } from '../../videos/interface';
import { DesktopView } from './desktop-view';
import { MobileView } from './mobile-view';

const VideoDetailContainer = (props: VideoDetailContainerProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileView {...props} />;
  }

  return <DesktopView {...props} />;
};

export { VideoDetailContainer };
