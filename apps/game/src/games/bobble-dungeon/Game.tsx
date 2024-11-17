import React, { useEffect } from 'react';
import GameContainer from '../../core/GameContainer';
import { EventBus } from '../../core/EventBus';
import { RESULT_SAVED } from './events/Events';
import config from './config';

const Game = () => {
  useEffect(() => {
    EventBus.on(RESULT_SAVED, (data: any) => {
      // @ts-ignore
      const currentData = localStorage.getItem(RESULT_SAVED);

      if (!currentData) {
        localStorage.setItem(RESULT_SAVED, JSON.stringify(data));
        return;
      }

      const currentResult = JSON.parse(currentData);
      const currentScore = currentResult.seconds;

      if (currentScore < data.seconds) {
        localStorage.setItem(RESULT_SAVED, JSON.stringify(data));
      }
    });
  }, []);

  return <GameContainer config={config} />;
};

export default Game;
