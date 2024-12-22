import { Auth, watchQueryHooks } from 'core';
import React, { useState } from 'react';
import { WatchUI, UniversalUI } from 'ui';
const { Header, SettingsPanel, VideosContainer } = WatchUI;

const Home = () => {
  const authContext = Auth.useAuthContext();
  const { getAccessToken } = authContext;
  const videoResult = watchQueryHooks.useLoadVideos({
    getAccessToken,
  });
  const [settingOpen, toggleSetting] = useState<boolean>(false);

  return (
    <UniversalUI.FullWidthContainer>
      <Header toggleSetting={toggleSetting} />
      <SettingsPanel open={settingOpen} toggle={toggleSetting} />
      <VideosContainer {...videoResult} />
    </UniversalUI.FullWidthContainer>
  );
};

export { Home };
