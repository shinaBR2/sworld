import React, { useEffect } from 'react';
import { EventBus } from '../../core/EventBus';
import GameContainer from '../../core/GameContainer';
import config from './config';
import { RESULT_SAVED } from './events/Events';

const Game = () => {
  useEffect(() => {
    EventBus.on(RESULT_SAVED, (data: any) => {
      // @ts-expect-error
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
