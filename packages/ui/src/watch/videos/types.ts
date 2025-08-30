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

interface GenericLinkProps<T = Record<string, unknown>> {
  to: string;
  params?: T;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

type LinkComponentType<T = Record<string, unknown>> = React.ComponentType<GenericLinkProps<T>>;

type RequiredLinkComponent<T = Record<string, unknown>> = {
  LinkComponent: LinkComponentType<T>;
  linkProps: {
    to: string;
    params?: T;
  };
};

type RequiredLinkComponentWithoutLinkProps = Omit<RequiredLinkComponent, 'linkProps'>;

interface WithLinkComponent<T = Record<string, unknown>> {
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
