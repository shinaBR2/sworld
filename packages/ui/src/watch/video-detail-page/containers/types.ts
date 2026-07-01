import type { useLoadPlaylistDetail } from 'core/watch/query-hooks/playlist-detail';
import type { useLoadVideoDetail } from 'core/watch/query-hooks/video-detail';
import type { RequiredLinkComponent } from '../../videos/types';

interface DetailNotification {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface VideoDetailContainerProps
  extends Omit<RequiredLinkComponent, 'linkProps'> {
  onVideoEnded?: (nextVideo: { id: string; slug: string }) => void;
  queryRs:
    | ReturnType<typeof useLoadPlaylistDetail>
    | ReturnType<typeof useLoadVideoDetail>;
  activeVideoId: string;
  autoPlay?: boolean;
  onShare?: (emails: string[]) => void;
  onNotify?: (notification: DetailNotification) => void;
  onThumbnailUpdated?: () => void;
}

export type { DetailNotification, VideoDetailContainerProps };
