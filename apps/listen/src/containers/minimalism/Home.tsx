import React from "react";
import { ListenUI, SUI } from "ui";
import { ListenCore } from "core";
import db from "../../providers/firestore";

const { SBackdrop } = SUI;
const { AppBar, HomeContainer } = ListenUI.Minimalism;
const { useListenHomeAudioList, useListenHomeFeelingList } = ListenCore;

const Home = () => {
  const { values: audioList, loading: loadingAudios } =
    useListenHomeAudioList(db);
  const { values: feelingList, loading: loadingFeelings } =
    useListenHomeFeelingList(db);
  const isLoadig = loadingAudios || loadingFeelings;

  if (isLoadig) {
    return (
      <SBackdrop open={true} loading={isLoadig}>
        {" "}
      </SBackdrop>
    );
  }

  return (
    <main>
      <AppBar />
      {!!audioList && !!audioList?.length && (
        <HomeContainer feelingList={feelingList} audioList={audioList} />
      )}
    </main>
  );
};

export default Home;
