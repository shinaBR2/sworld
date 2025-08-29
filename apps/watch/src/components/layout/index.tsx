import { Link } from '@tanstack/react-router';
import { Auth } from 'core';
import type React from 'react';
import { useState } from 'react';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { Header } from 'ui/watch/header';
import { SettingsPanel } from 'ui/watch/home-page/settings';
import { appConfig } from '../../config';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;
  const authContext = Auth.useAuthContext();
  const { signOut, user } = authContext;
  const [settingOpen, toggleSetting] = useState<boolean>(false);
  const { sites } = appConfig;

  return (
    <FullPageContainer>
      <Header
        LinkComponent={Link}
        toggleSetting={toggleSetting}
        sites={sites}
        user={user}
      />
      <SettingsPanel
        open={settingOpen}
        toggle={toggleSetting}
        actions={{
          logout: signOut,
        }}
      />
      {children}
    </FullPageContainer>
  );
};

export { Layout };
