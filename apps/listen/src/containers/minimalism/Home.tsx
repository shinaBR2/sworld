import React, { useState } from "react";
import { ListenUI, SUI } from "ui";
import { useGetHomeAudioList } from "../../hooks/dbQuery";

const { SBackdrop } = SUI;
const { MusicWidget } = ListenUI.Minimalism;

const Home = () => {
  const { values: audioList, loading } = useGetHomeAudioList();
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
