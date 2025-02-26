import { useLoadHistory } from 'core/watch/query-hooks/history';
import { MediaType } from 'core/watch/query-hooks';
import { RequiredLinkComponent } from '../videos/types';

interface HistoryVideo {
  id: string;
  type: MediaType;
  title: string;
  slug: string;
  source: string;
  thumbnailUrl: string;
  duration: number;
  user: {
    username: string;
  };
  progressSeconds?: number;
  createdAt: string;
  playlist?: ReturnType<typeof useLoadHistory>['videos'][number]['playlist'];
}

interface HistoryContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  videos: HistoryVideo[];
  isLoading: boolean;
  // error: Error;
}

export { type HistoryVideo, type HistoryContainerProps };
