import { useLoadHistory } from 'core/watch/query-hooks/history';
import { RequiredLinkComponent } from '../videos/types';

type HistoryVideo = ReturnType<typeof useLoadHistory>['videos'][number];

interface HistoryContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  videos: HistoryVideo[];
  isLoading: boolean;
  // error: Error;
}

export { type HistoryVideo, type HistoryContainerProps };
