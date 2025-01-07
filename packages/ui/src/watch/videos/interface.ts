import { watchQueryHooks } from 'core';

interface Uploader {
  username: string;
}

// TODO move this into universal
export type RequiredLinkComponent<P = unknown> = {
  LinkComponent: NonNullable<WithLinkComponent<P>['LinkComponent']>;
};

export interface WithLinkComponent<P = unknown> {
  asLink?: boolean;
  LinkComponent?: React.ComponentType<{
    to: string;
    params?: P;
    children: React.ReactNode;
    style?: React.CSSProperties;
  }>;
}

export interface Video {
  id: string;
  title: string;
  source: string;
  thumbnailUrl?: string;
  createdAt: string;
  duration?: string;
  user: Uploader;
}

export interface HomeContainerProps<P = unknown>
  extends RequiredLinkComponent<P> {
  queryRs: ReturnType<typeof watchQueryHooks.useLoadVideos>;
}

export interface VideoDetailContainerProps<P = unknown>
  extends RequiredLinkComponent<P> {
  queryRs: ReturnType<typeof watchQueryHooks.useLoadVideoDetail>;
}
