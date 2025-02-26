import { MediaType } from 'core/watch/query-hooks';
import { RequiredLinkComponent } from '../videos/types';

interface HistoryVideo {
  id: string;
  type: MediaType;
  title: string;
  thumbnailUrl: string;
  duration: number;
  user: {
    username: string;
  };
  progressSeconds?: number;
  createdAt: string;
}

interface HistoryContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  videos: HistoryVideo[];
  isLoading: boolean;
  // error: Error;
}

export { type HistoryContainerProps };
