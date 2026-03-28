import { Link } from '@tanstack/react-router';
import { Auth } from 'core';
import type React from 'react';
import { Header } from 'ui/til/header';
import type { MuiStyledProps } from 'ui/universal';
import { appConfig } from '../../config';
import { FullPageContainer } from 'ui/universal/containers/full-page';

interface LayoutProps extends MuiStyledProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children, sx } = props;
  const { sites } = appConfig;
  const { user, signIn, signOut } = Auth.useAuthContext();

  return (
    <FullPageContainer sx={sx}>
      <Header
        LinkComponent={Link}
        sites={sites}
        user={user}
        login={signIn}
        logout={signOut}
      />
      {children}
    </FullPageContainer>
  );
};

export { Layout };
