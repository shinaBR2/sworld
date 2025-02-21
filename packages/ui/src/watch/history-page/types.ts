import { RequiredLinkComponent, Video } from '../videos/interface';

interface HistoryContainerProps extends RequiredLinkComponent {
  videos: Video[];
  isLoading: boolean;
  // error: Error;
}

export { type HistoryContainerProps };
