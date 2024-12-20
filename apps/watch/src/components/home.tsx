import { Auth, watchQueryHooks } from 'core';
import React, { useState } from 'react';
import { WatchUI } from 'ui';
const { HomeContainer, Header, SettingsPanel, VideosContainer } = WatchUI;

const Home = () => {
  const authContext = Auth.useAuthContext();
  const { getAccessToken } = authContext;
  const videoResult = watchQueryHooks.useLoadVideos({
    getAccessToken,
  });
  const [settingOpen, toggleSetting] = useState<boolean>(false);

  return (
    <HomeContainer>
      <Header toggleSetting={toggleSetting} />
      <SettingsPanel open={settingOpen} toggle={toggleSetting} />
      <VideosContainer {...videoResult} />
    </HomeContainer>
  );
};

export { Home };
