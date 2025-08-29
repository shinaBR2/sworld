import { Link } from '@tanstack/react-router';
import type React from 'react';
import { Header } from 'ui/til/header';
import type { MuiStyledProps } from 'ui/universal';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { appConfig } from '../../config';

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
