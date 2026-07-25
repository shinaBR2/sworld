interface GenericLinkProps<T = Record<string, unknown>> {
  to: string;
  params?: T;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

type LinkComponentType<T = Record<string, unknown>> = React.ComponentType<
  GenericLinkProps<T>
>;

interface PhotoLinkProps<T = Record<string, unknown>> {
  to: string;
  params?: T;
}

export type { LinkComponentType, PhotoLinkProps };
