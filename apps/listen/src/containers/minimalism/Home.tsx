import { listenQueryHooks } from 'core';
import { useAuthContext } from 'core/providers/auth';
import React, { useState } from 'react';
import { FeelingList, Header, MainContainer } from 'ui/listen/minimalism';
import { FullWidthContainer, LoadingBackdrop } from 'ui/universal';
import { appConfig } from '../../config';

interface ContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryRs: any;
}

const SettingsPanel = React.lazy(() =>
  import('ui/listen/minimalism/home/settings').then((mod) => ({
    default: mod.SettingsPanel,
  })),
);

const AudioList = React.lazy(() =>
  import('ui/listen/minimalism').then((mod) => ({
    default: mod.AudioList,
  })),
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
  const { getAccessToken } = useAuthContext();
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
  } = useAuthContext();
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
