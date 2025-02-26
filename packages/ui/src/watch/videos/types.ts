interface PlayableVideo {
  id: string;
  title: string;
  source: string;
  thumbnailUrl: string;
}

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

export { type PlayableVideo, type LinkComponentType, type RequiredLinkComponent, type WithLinkComponent };
