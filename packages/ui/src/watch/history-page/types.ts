import { RequiredLinkComponent, Video } from '../videos/types';

interface HistoryContainerProps extends RequiredLinkComponent {
  videos: Video[];
  isLoading: boolean;
  // error: Error;
}

export { type HistoryContainerProps };
