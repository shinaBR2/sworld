import React, { StrictMode, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { Auth } from 'core';
import { UniversalUI } from 'ui';
import { GameUI } from 'ui';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';

const { LoadingBackdrop } = UniversalUI;
const { UniversalMinimalismThemeProvider } = UniversalUI.Minimalism;

const { Dialogs, Containers } = GameUI.Minimalism;
const { SignInDialog, ChooseAvatar } = Dialogs;
const { HomeContainer } = Containers;

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

const App = () => {
  const { user, isLoading, isSignedIn, signIn } = Auth.useAuthContext();
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [showChooseAvatarInDialog, setShowChooseAvatarInDialog] =
    useState(true);

  useEffect(() => {
    if (isSignedIn) {
      EventBus.emit('signed_in', isSignedIn);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      setShowSignInDialog(true);
    }
  }, [isLoading]);

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    console.log('current scene', scene.scene.key);
  };

  console.log('user', user);
  console.log('isLoading', isLoading);
  console.log('isSignedIn', isSignedIn);

  const handleSignedIn = () => {
    signIn();
    setShowSignInDialog(false);
  };

  const handleSelectAvatar = (value: string) => {
    EventBus.emit('avatar_selected', value);
    setShowChooseAvatarInDialog(false);
  };
  const gameList = [
    {
      id: '1',
      name: 'Bobble dungeon',
      slug: 'bobble-dungeon',
      description: 'Ride the Dungeons with just a bubble shooter.',
      imageUrl: '/assets/bobble-dungeon/bobble_dungeon_intro.png',
    },
    {
      id: '2',
      name: 'Evil Minds',
      slug: 'evil-minds',
      description: 'Who is the next victim?',
      imageUrl: '/assets/evil-minds/intro.png',
    },
  ];

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  return (
    <UniversalMinimalismThemeProvider>
      {/* <SignInDialog open={showSignInDialog} onSubmit={handleSignedIn} />
        <ChooseAvatar
          open={showChooseAvatarInDialog}
          onSubmit={handleSelectAvatar}
        /> */}
      <HomeContainer gameList={gameList} />

      {/* <PhaserGame ref={phaserRef} currentActiveScene={currentScene} /> */}
    </UniversalMinimalismThemeProvider>
  );
};

export default App;
