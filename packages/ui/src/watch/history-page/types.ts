import { TransformedMediaItem } from 'core/watch/query-hooks';
import { RequiredLinkComponent } from '../videos/types';

interface HistoryContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  videos: TransformedMediaItem[];
  isLoading: boolean;
  // error: Error;
}

export { type HistoryContainerProps };
