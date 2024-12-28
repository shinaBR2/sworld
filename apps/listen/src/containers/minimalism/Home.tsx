import React, { useState } from 'react';
import { ListenUI, UniversalUI } from 'ui';
import { Auth, listenQueryHooks } from 'core';
import { appConfig } from '../../config';

const { LoadingBackdrop } = UniversalUI;
const { MainContainer, Header, SettingsPanel, FeelingList, AudioList } =
  ListenUI.Minimalism;

const AnonymousContent = () => {
  const [activeFeelingId, setActiveFeelingId] = useState<string>('');
  const queryRs = listenQueryHooks.useLoadPublicAudios();

  return (
    <>
      <FeelingList
        activeId={activeFeelingId}
        onSelect={setActiveFeelingId}
        queryRs={queryRs}
      />
      <AudioList
        queryRs={queryRs}
        list={queryRs.data?.audios ?? []}
        activeFeelingId={activeFeelingId}
      />
    </>
  );
};

const AuthenticatedContent = () => {
  const [activeFeelingId, setActiveFeelingId] = useState<string>('');
  const { getAccessToken } = Auth.useAuthContext();
  const queryRs = listenQueryHooks.useLoadAudios({
    getAccessToken,
  });

  return (
    <>
      <FeelingList
        activeId={activeFeelingId}
        onSelect={setActiveFeelingId}
        queryRs={queryRs}
      />
      <AudioList
        queryRs={queryRs}
        list={queryRs.data?.audios ?? []}
        activeFeelingId={activeFeelingId}
      />
    </>
  );
};

const Home = () => {
  const {
    isSignedIn,
    isLoading: authLoading,
    signOut,
    user,
  } = Auth.useAuthContext();
  const [settingOpen, toggleSetting] = useState<boolean>(false);
  const { sites } = appConfig;

  if (authLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  return (
    <UniversalUI.FullWidthContainer>
      <Header sites={sites} toggleSetting={toggleSetting} user={user} />
      <SettingsPanel
        open={settingOpen}
        toggle={toggleSetting}
        actions={{
          logout: signOut,
        }}
      />
      <MainContainer>
        {isSignedIn ? <AuthenticatedContent /> : <AnonymousContent />}
      </MainContainer>
    </UniversalUI.FullWidthContainer>
  );
};

export default Home;
