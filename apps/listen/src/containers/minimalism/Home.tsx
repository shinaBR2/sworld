import React, { useEffect, useState } from "react";
import { ListenUI, SUI } from "ui";
import { ListenCore } from "core";
import db from "../../providers/firestore";

const { SBackdrop } = SUI;
const { MusicWidget } = ListenUI.Minimalism;
const { useGetHomeAudioList } = ListenCore;

enum LoopMode {
  None = "none",
  All = "all",
  One = "one",
}

interface AudioItem {
  src: string;
  name: string;
  artistName: string;
  image: string;
}

const Home = () => {
  const { values: audioList, loading } = useGetHomeAudioList(db);

  return (
    <main>
      <SBackdrop open={true} loading={loading}>
        {!!audioList && <MusicWidget audioList={audioList} />}
      </SBackdrop>
    </main>
  );
};

export default Home;
