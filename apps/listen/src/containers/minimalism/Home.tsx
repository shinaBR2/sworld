import React from "react";
import { ListenUI, SUI } from "ui";
import { ListenCore } from "core";
import db from "../../providers/firestore";

const { SBackdrop } = SUI;
const { AppBar, HomeContainer } = ListenUI.Minimalism;
const { useListenHomeAudioList } = ListenCore;

console.log(db);

const Home = () => {
  const { values: audioList, loading } = useListenHomeAudioList(db);

  if (loading) {
    return (
      <SBackdrop open={true} loading={loading}>
        {" "}
      </SBackdrop>
    );
  }

  return (
    <main>
      <AppBar />
      {!!audioList && <HomeContainer audioList={audioList} />}
    </main>
  );
};

export default Home;
