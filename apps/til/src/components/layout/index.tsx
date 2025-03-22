import { FullPageContainer } from 'ui/universal/containers/full-page';
import { appConfig } from '../../config';
import { Header } from 'ui/til/header';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { MuiStyledProps } from 'ui/universal';

interface LayoutProps extends MuiStyledProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children, sx } = props;
  const { sites } = appConfig;

  return (
    <FullPageContainer sx={sx}>
      <Header LinkComponent={Link} sites={sites} />
      {children}
    </FullPageContainer>
  );
};

export { Layout };
