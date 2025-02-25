import { useLoadPlaylistDetail } from 'core/watch/query-hooks/playlist-detail';
import { RequiredLinkComponent } from '../../videos/types';
import { useLoadVideoDetail } from 'core/watch/query-hooks/video-detail';

interface VideoDetailContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  queryRs: ReturnType<typeof useLoadPlaylistDetail> | ReturnType<typeof useLoadVideoDetail>;
  activeVideoId: string;
}

export { type VideoDetailContainerProps };
