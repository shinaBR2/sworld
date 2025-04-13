import { FullPageContainer } from 'ui/universal/containers/full-page';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;

  return <FullPageContainer>{children}</FullPageContainer>;
};

export { Layout };
