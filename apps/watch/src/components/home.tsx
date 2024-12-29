import { Auth, watchQueryHooks } from 'core';
import React, { useState } from 'react';
import { FullWidthContainer } from 'ui/universal';
import { Header, SettingsPanel, VideosContainer } from 'ui/watch';
import { appConfig } from '../config';

const Home = () => {
  const authContext = Auth.useAuthContext();
  const { getAccessToken, signOut, user } = authContext;
  const videoResult = watchQueryHooks.useLoadVideos({
    getAccessToken,
  });
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
      <VideosContainer {...videoResult} />
    </FullWidthContainer>
  );
};

export { Home };
