import { FullWidthContainer } from 'ui/universal/containers/full-width';
import { appConfig } from '../config';
import { Auth } from 'core';
import { useState } from 'react';
import { Header } from 'ui/watch/header';
import { SettingsPanel } from 'ui/watch/home-page/settings';

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
    <FullWidthContainer>
      <Header toggleSetting={toggleSetting} sites={sites} user={user} />
      <SettingsPanel
        open={settingOpen}
        toggle={toggleSetting}
        actions={{
          logout: signOut,
        }}
      />
      {children}
    </FullWidthContainer>
  );
};

export { Layout };
