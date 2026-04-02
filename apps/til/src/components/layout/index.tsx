import { Link } from '@tanstack/react-router';
import { Auth } from 'core';
import type React from 'react';
import { useState } from 'react';
import { SettingsPanel } from 'ui/til/settings';
import type { MuiStyledProps } from 'ui/universal';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { appConfig } from '../../config';
import { Header } from './Header';

interface LayoutProps extends MuiStyledProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children, sx } = props;
  const { sites } = appConfig;
  const { user, signIn, signOut } = Auth.useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <FullPageContainer sx={sx}>
      <Header
        LinkComponent={Link}
        sites={sites}
        user={user}
        login={signIn}
        toggleSidebar={toggleSidebar}
      />
      <SettingsPanel
        open={sidebarOpen}
        toggle={setSidebarOpen}
        LinkComponent={Link}
        actions={{
          logout: signOut,
        }}
      />
      {children}
    </FullPageContainer>
  );
};

export { Layout };
