import type { ReactNode } from 'react';
import { FullPageContainer } from 'ui/universal/containers/full-page';

interface LayoutProps {
  children: ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;

  return <FullPageContainer>{children}</FullPageContainer>;
};

export { Layout };
