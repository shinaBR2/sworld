import type { useLoadHistory } from 'core/watch/query-hooks/history';
import type { RequiredLinkComponent } from '../videos/types';

type HistoryVideo = ReturnType<typeof useLoadHistory>['videos'][number];

interface HistoryContainerProps
  extends Omit<RequiredLinkComponent, 'linkProps'> {
  videos: HistoryVideo[];
  isLoading: boolean;
  // error: Error;
}

export type { HistoryVideo, HistoryContainerProps };
