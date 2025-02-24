import { watchQueryHooks } from 'core';
import { useLoadPlaylistDetail } from 'core/watch/query-hooks/playlist-detail';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GenericLinkProps<T = any> {
  to: string;
  params?: T;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LinkComponentType<T = any> = React.ComponentType<GenericLinkProps<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequiredLinkComponent<T = any> = {
  LinkComponent: LinkComponentType<T>;
  linkProps: {
    to: string;
    params?: T;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface WithLinkComponent<T = any> {
  asLink?: boolean;
  LinkComponent?: LinkComponentType<T>;
  linkProps?: {
    to: string;
    params?: T;
  };
}

type Video = ReturnType<typeof watchQueryHooks.useLoadVideos>['videos'][0];
type VideoItem = ReturnType<typeof watchQueryHooks.useLoadVideoDetail>['videos'][0];

interface HomeContainerProps extends RequiredLinkComponent {
  queryRs: ReturnType<typeof watchQueryHooks.useLoadVideos>;
}

interface VideoDetailContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  queryRs: ReturnType<typeof useLoadPlaylistDetail>;
}

export {
  type LinkComponentType,
  type RequiredLinkComponent,
  type WithLinkComponent,
  type Video,
  type VideoItem,
  type HomeContainerProps,
  type VideoDetailContainerProps,
};
