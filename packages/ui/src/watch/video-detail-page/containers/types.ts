import { useLoadPlaylistDetail } from 'core/watch/query-hooks/playlist-detail';
import { useLoadVideoDetail } from 'core/watch/query-hooks/video-detail';
import { RequiredLinkComponent } from '../../videos/types';

interface VideoDetailContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  queryRs: ReturnType<typeof useLoadPlaylistDetail> | ReturnType<typeof useLoadVideoDetail>;
  activeVideoId: string;
}

export { type VideoDetailContainerProps };
