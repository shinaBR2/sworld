import { Auth, watchQueryHooks } from 'core';
import React, { useState } from 'react';
import { WatchUI, UniversalUI } from 'ui';
import { appConfig } from '../config';
const { Header, SettingsPanel, VideosContainer } = WatchUI;

const Home = () => {
  const authContext = Auth.useAuthContext();
  const { getAccessToken, signOut, user } = authContext;
  const videoResult = watchQueryHooks.useLoadVideos({
    getAccessToken,
  });
  const [settingOpen, toggleSetting] = useState<boolean>(false);
  const { sites } = appConfig;

  return (
    <UniversalUI.FullWidthContainer>
      <Header toggleSetting={toggleSetting} sites={sites} user={user} />
      <SettingsPanel
        open={settingOpen}
        toggle={toggleSetting}
        actions={{
          logout: signOut,
        }}
      />
      <VideosContainer {...videoResult} />
    </UniversalUI.FullWidthContainer>
  );
};

export { Home };
