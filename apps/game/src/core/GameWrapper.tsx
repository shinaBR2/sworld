import type React from 'react';
import { useLoadGame } from './hooks/useLoadGame';

const GameWrapper = () => {
  const Component = useLoadGame() as React.ElementType;

  if (!Component) {
    return null;
  }

  return <Component />;
};

export default GameWrapper;
