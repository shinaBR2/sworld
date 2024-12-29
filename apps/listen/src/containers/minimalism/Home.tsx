import React, { useState } from 'react';
import { Auth, listenQueryHooks } from 'core';
import { appConfig } from '../../config';

import { LoadingBackdrop, FullWidthContainer } from 'ui/universal';
import { MainContainer, Header, FeelingList } from 'ui/listen/minimalism';

interface ContentProps {
  queryRs: any;
}

const SettingsPanel = React.lazy(() =>
  import('ui/listen/minimalism').then(mod => ({
    default: mod.SettingsPanel,
  }))
);

const AudioList = React.lazy(() =>
  import('ui/listen/minimalism').then(mod => ({
    default: mod.AudioList,
  }))
);

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
      <React.Suspense fallback={<div />}>
        <AudioList
          queryRs={queryRs}
          list={queryRs.data?.audios ?? []}
          activeFeelingId={activeFeelingId}
        />
      </React.Suspense>
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
    signIn,
    signOut,
    user,
  } = Auth.useAuthContext();
  const [settingOpen, toggleSetting] = useState<boolean>(false);
  const { sites } = appConfig;
  const onProfileClick = () => {
    if (user) {
      toggleSetting(true);
    } else {
      signIn();
    }
  };

  if (authLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  return (
    <FullWidthContainer>
      <Header sites={sites} onProfileClick={onProfileClick} user={user} />
      <React.Suspense fallback={<div />}>
        <SettingsPanel
          open={settingOpen}
          toggle={toggleSetting}
          actions={{
            logout: signOut,
          }}
        />
      </React.Suspense>
      <MainContainer>
        {isSignedIn ? <AuthenticatedContent /> : <AnonymousContent />}
      </MainContainer>
    </FullWidthContainer>
  );
};

export default Home;
