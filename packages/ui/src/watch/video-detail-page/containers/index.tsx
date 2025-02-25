import { useIsMobile } from '../../../universal/responsive';
import { DesktopView } from './desktop-view';
import { MobileView } from './mobile-view';
import { VideoDetailContainerProps } from './types';

const VideoDetailContainer = (props: VideoDetailContainerProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileView {...props} />;
  }

  return <DesktopView {...props} />;
};

export { VideoDetailContainer };
