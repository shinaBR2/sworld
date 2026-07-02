import { Auth } from 'core';
import React, { useState } from 'react';
import { Header, MainContainer, SettingsPanel } from 'ui/listen/minimalism';
import { FullWidthContainer } from 'ui/universal';
import { appConfig } from '../../config';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;
  const { signIn, signOut, user } = Auth.useAuthContext();
  const [settingOpen, toggleSetting] = useState<boolean>(false);
  const { sites } = appConfig;

  const onProfileClick = () => {
    if (user) {
      toggleSetting(true);
    } else {
      signIn();
    }
  };

  return (
    <FullWidthContainer>
      <Header sites={sites} onProfileClick={onProfileClick} user={user} />
      <React.Suspense fallback={<div />}>
        <SettingsPanel
          open={settingOpen}
          toggle={toggleSetting}
          actions={{ logout: signOut }}
        />
      </React.Suspense>
      <MainContainer>{children}</MainContainer>
    </FullWidthContainer>
  );
};

export { Layout };
