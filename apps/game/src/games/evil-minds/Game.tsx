import React, { useEffect, useState } from 'react';
import { GameUI } from 'ui';
import GameContainer from '../../core/GameContainer';
import { EventBus } from '../../core/EventBus';
import config from './config';
import {
  PLAYER_DONE_READ_HOUSE_SIGN,
  PLAYER_READ_HOUSE_SIGN,
} from './events/playerEvents';

const { Dialogs, Containers } = GameUI.Minimalism;
const { GameDialogue } = Dialogs;

const dialogue: GameUI.Dialog.DialogueContent = {
  speaker: 'Elder Sage',
  text: `Welcome, young adventurer. Our village has been plagued by mysterious creatures emerging from the ancient ruins to the north. Many of our bravest warriors have ventured forth to investigate, but none have returned. The situation grows dire with each passing day, and our resources dwindle as we struggle to defend our homes. We desperately need someone with your skills and courage to help us uncover the source of these attacks and put an end to them. Will you assist us in our time of need?`,
  choices: [
    {
      text: 'I will help you',
      nextDialogue: {
        speaker: 'Elder Sage 3',
        text: 'Thank you, brave one! Let me tell you what we know about the ruins and the creatures that emerge from them...',
        // More nested dialogue
      },
    },
    {
      text: 'Tell me more about the rewards',
      nextDialogue: {
        speaker: 'Elder Sage 2',
        text: 'Of course, I understand your interest. The village council has gathered a substantial reward...',
      },
    },
  ],
};
const Game = () => {
  const [showDialogue, setShowDialogue] = useState(false);
  const onCloseDialogue = () => {
    console.log('onclose dialog called');
    EventBus.emit(PLAYER_DONE_READ_HOUSE_SIGN);
    setShowDialogue(false);
  };

  useEffect(() => {
    EventBus.on(PLAYER_READ_HOUSE_SIGN, (scene: Phaser.Scene) => {
      setShowDialogue(true);
    });

    return () => {
      EventBus.removeListener(PLAYER_READ_HOUSE_SIGN);
    };
  }, []);

  return (
    <>
      <GameContainer config={config} />
      <GameDialogue
        isOpen={showDialogue}
        onClose={onCloseDialogue}
        dialogue={dialogue}
      />
    </>
  );
};

export default Game;
