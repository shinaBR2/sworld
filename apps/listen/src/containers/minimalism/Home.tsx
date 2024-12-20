import React from 'react';
import { ListenUI, UniversalUI } from 'ui';
import { Auth, ListenCore, watchQueryHooks } from 'core';
import db from '../../providers/firestore';

const { LoadingBackdrop, Logo } = UniversalUI;
const { AppBar, HomeContainer } = ListenUI.Minimalism;
const { useListenHomeAudioList, useListenHomeFeelingList } = ListenCore;

const Home = () => {
  const { user, signIn, isLoading, getAccessToken } = Auth.useAuthContext();
  const data = watchQueryHooks.useLoadVideos({
    getAccessToken,
  });
  const { values: audioList, loading: loadingAudios } =
    useListenHomeAudioList(db);
  const { values: feelingList, loading: loadingFeelings } =
    useListenHomeFeelingList(db);
  const isLoadig = loadingAudios || loadingFeelings;
  const hasAudio = !!audioList && !!audioList?.length;
  const hasFeeling = !!feelingList && !!feelingList?.length;
  const hasFullData = hasAudio && hasFeeling;

  if (isLoadig) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  return (
    <>
      <AppBar>
        <Logo />
      </AppBar>
      <main>
        {hasFullData && (
          <HomeContainer feelingList={feelingList} audioList={audioList} />
        )}
      </main>
    </>
  );
};

export default Home;
