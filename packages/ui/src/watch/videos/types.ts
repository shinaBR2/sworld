interface Subtitle {
  id: string;
  lang: string;
  src: string;
  isDefault: boolean;
  label: string;
}

interface PlayableVideo {
  id: string;
  title: string;
  source: string;
  thumbnailUrl: string;
  subtitles?: Subtitle[];
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

type RequiredLinkComponentWithoutLinkProps = Omit<
  RequiredLinkComponent,
  'linkProps'
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface WithLinkComponent<T = any> {
  asLink?: boolean;
  LinkComponent?: LinkComponentType<T>;
  linkProps?: {
    to: string;
    params?: T;
  };
}

export type {
  LinkComponentType,
  PlayableVideo,
  RequiredLinkComponent,
  RequiredLinkComponentWithoutLinkProps,
  WithLinkComponent,
};
