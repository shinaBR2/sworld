import React, { useState } from 'react';
import { ListenUI, UniversalUI } from 'ui';
import { Auth, listenQueryHooks } from 'core';
import { appConfig } from '../../config';

const { LoadingBackdrop } = UniversalUI;
const { MainContainer, Header, SettingsPanel, FeelingList, AudioList } =
  ListenUI.Minimalism;

interface ContentProps {
  queryRs: any;
}

const Content = (props: ContentProps) => {
  const [activeFeelingId, setActiveFeelingId] = useState<string>('');
  const { queryRs } = props;

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

const AnonymousContent = () => {
  const queryRs = listenQueryHooks.useLoadPublicAudios();

  return <Content queryRs={queryRs} />;
};

const AuthenticatedContent = () => {
  const { getAccessToken } = Auth.useAuthContext();
  const queryRs = listenQueryHooks.useLoadAudios({
    getAccessToken,
  });

  return <Content queryRs={queryRs} />;
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
