import { Auth, watchQueryHooks } from 'core';
import React, { useState } from 'react';
import { FullWidthContainer } from 'ui/universal';
import { Header, SettingsPanel, VideosContainer } from 'ui/watch';
import { appConfig } from '../config';
import { Link } from '@tanstack/react-router';

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
      <VideosContainer
        queryRs={videoResult}
        asLink={true}
        LinkComponent={Link}
      />
    </FullWidthContainer>
  );
};

export { Home };
