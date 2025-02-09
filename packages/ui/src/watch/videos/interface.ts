import { watchQueryHooks } from 'core';

interface Uploader {
  username: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GenericLinkProps<T = any> {
  to: string;
  params?: T;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LinkComponentType<T = any> = React.ComponentType<GenericLinkProps<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequiredLinkComponent<T = any> = {
  LinkComponent: LinkComponentType<T>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WithLinkComponent<T = any> {
  asLink?: boolean;
  LinkComponent?: LinkComponentType<T>;
}

export interface Video {
  id: string;
  title: string;
  source: string;
  thumbnailUrl?: string;
  createdAt: string;
  duration?: string;
  user: Uploader;
  progressSeconds?: number;
  lastWatchedAt?: string | null;
}

export interface HomeContainerProps extends RequiredLinkComponent {
  queryRs: ReturnType<typeof watchQueryHooks.useLoadVideos>;
}

export interface VideoDetailContainerProps extends RequiredLinkComponent {
  queryRs: ReturnType<typeof watchQueryHooks.useLoadVideoDetail>;
}
