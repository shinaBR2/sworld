import { watchQueryHooks } from 'core';

interface Uploader {
  username: string;
}

// TODO move this into universal
export type RequiredLinkComponent<P = any> = {
  LinkComponent: NonNullable<WithLinkComponent<P>['LinkComponent']>;
};

export interface WithLinkComponent<P = any> {
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
  thumbnail?: string;
  createdAt: string;
  duration?: string;
  user: Uploader;
}

export interface HomeContainerProps<P = any> extends RequiredLinkComponent<P> {
  queryRs: ReturnType<typeof watchQueryHooks.useLoadVideos>;
}

export interface VideoDetailContainerProps<P = any>
  extends RequiredLinkComponent<P> {
  queryRs: ReturnType<typeof watchQueryHooks.useLoadVideos>;
}
