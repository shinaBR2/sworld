import React, { useState } from "react";
import { ListenUI, SUI } from "ui";

const { SBackdrop } = SUI;
const { MusicWidget } = ListenUI.Minimalism;

const Home = () => {
  const audioList = [
    {
      src: "https://res.cloudinary.com/shinabr2/video/upload/v1667828415/Public/Music/Japanese/Attack-on-Titan-Opening-1-Feuerroter-Pfeil-und-Bogen-Full-128-Linked-Horizon_1.mp3",
      name: "Guren No Yumiya",
      artistName: "Linked Horizon",
      image:
        "https://res.cloudinary.com/shinabr2/image/upload/v1667828561/Public/Images/artworks-000141088556-xy2nav-t500x500.jpg",
    },
    {
      src: "https://res.cloudinary.com/shinabr2/video/upload/v1667831555/Public/Music/Japanese/Shinzou_wo_Sasageyo__-_Linked_Horizon.mp3",
      name: "Shinzo wo Sasageyo",
      artistName: "Linked Horizon",
      image:
        "https://res.cloudinary.com/shinabr2/image/upload/v1667828561/Public/Images/artworks-000141088556-xy2nav-t500x500.jpg",
    },
  ];
  const [currentAudio, setCurrentAudio] = useState(0);

  return (
    <main>
      <SBackdrop open={true}>
        <MusicWidget
          audioList={audioList}
          index={currentAudio}
          setIndex={setCurrentAudio}
        />
      </SBackdrop>
    </main>
  );
};

export default Home;
