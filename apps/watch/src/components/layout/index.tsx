import { FullPageContainer } from 'ui/universal/containers/full-page';
import { appConfig } from '../../config';
import { Header } from 'ui/til/header';
import { Link } from '@tanstack/react-router';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;
  const { sites } = appConfig;

  return (
    <FullPageContainer>
      <Header LinkComponent={Link} sites={sites} />
      {children}
    </FullPageContainer>
  );
};

export { Layout };
