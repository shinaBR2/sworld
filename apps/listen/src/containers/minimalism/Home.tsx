import React, { useState } from "react";
import { ListenUI, SUI } from "ui";
import { ListenCore } from "core";
import db from "../../providers/firestore";

const { SBackdrop } = SUI;
const { MusicWidget } = ListenUI.Minimalism;
const { useGetHomeAudioList } = ListenCore;

const Home = () => {
  const { values: audioList, loading } = useGetHomeAudioList(db);
  const [currentAudio, setCurrentAudio] = useState(0);

  return (
    <main>
      <SBackdrop open={true} loading={loading}>
        {!!audioList && (
          <MusicWidget
            audioList={audioList}
            index={currentAudio}
            setIndex={setCurrentAudio}
          />
        )}
      </SBackdrop>
    </main>
  );
};

export default Home;
