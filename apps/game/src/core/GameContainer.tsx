import React, { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';

interface GameContainerProps {
  config: Phaser.Types.Core.GameConfig;
}

const GameContainer = (props: GameContainerProps) => {
  const { config } = props;
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  const currentScene = (scene: Phaser.Scene) => {
    console.log('current scene', scene.scene.key);
  };

  return (
    <div id="game-container">
      <PhaserGame
        config={config}
        ref={phaserRef}
        currentActiveScene={currentScene}
      />
    </div>
  );
};

export default GameContainer;
