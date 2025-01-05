import { watchQueryHooks } from 'core';

interface Uploader {
  username: string;
}

export type RequiredLinkComponent = {
  LinkComponent: NonNullable<WithLinkComponent['LinkComponent']>;
};

export interface WithLinkComponent {
  asLink?: boolean;
  LinkComponent?: React.ComponentType<{
    to: string;
    params?: Record<string, string>;
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

export interface VideosContainerProps extends RequiredLinkComponent {
  queryRs: ReturnType<typeof watchQueryHooks.useLoadVideos>;
}

export interface VideoDetailContainerProps extends RequiredLinkComponent {
  queryRs: ReturnType<typeof watchQueryHooks.useLoadVideos>;
}
