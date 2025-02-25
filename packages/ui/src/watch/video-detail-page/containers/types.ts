import { useLoadPlaylistDetail } from 'core/watch/query-hooks/playlist-detail';
import { RequiredLinkComponent } from '../../videos/types';

interface VideoDetailContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  queryRs: ReturnType<typeof useLoadPlaylistDetail>;
  activeVideoId: string;
}

export { type VideoDetailContainerProps };
