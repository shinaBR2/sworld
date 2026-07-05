import { Link } from '@tanstack/react-router';
import { Auth } from 'core';
import type React from 'react';
import { useState } from 'react';
import { SettingsPanel } from 'ui/til/settings';
import type { MuiStyledProps } from 'ui/universal';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { Header } from 'ui/universal/header';
import { appConfig } from '../../config';

interface LayoutProps extends MuiStyledProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children, sx } = props;
  const { sites } = appConfig;
  const { user, signIn, signOut } = Auth.useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const onAvatarClick = () => {
    if (user) {
      setSidebarOpen(true);
    } else {
      signIn();
    }
  };

  return (
    <FullPageContainer sx={sx}>
      <Header
        LinkComponent={Link}
        user={user}
        onAvatarClick={onAvatarClick}
        siteChoices={{ activeSite: 'til', sites }}
      />
      <SettingsPanel
        open={sidebarOpen}
        toggle={setSidebarOpen}
        actions={{
          logout: signOut,
        }}
      />
      {children}
    </FullPageContainer>
  );
};

export { Layout };
