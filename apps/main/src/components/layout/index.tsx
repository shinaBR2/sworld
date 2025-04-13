import { FullWidthContainer } from 'ui/universal/containers/full-width';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;

  return <FullWidthContainer>{children}</FullWidthContainer>;
};

export { Layout };
