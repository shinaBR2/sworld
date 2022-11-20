Life Core

# Overview

This provide the hooks and helper methods you will need in your entire life of web development.

The first hook is the headless ui component for audio player, will be updated in the future.

## Installation

Install the npm module through your preferred package management

```
npm install @shinabr2/life-core
yarn add @shinabr2/life-core
pnpm add @shinabr2/life-core
```

## Using

```
import hooks from "@shinabr2/life-core";


const { useSAudioPlayer } = hooks;
```

# Example using useSAudioPlayer

Many reacjt developers want to develop and publish npm packages for reusable, and so do I. Since the first few days working with reactjs, I feel it does not make sense to build a react UI library but depends on the UI framework.

Few concerns:

- Why do I need to import material UI or the antd design just for using a library? If I am going to use another UI library like semantic, why does it break?
- What if I want to control the rendered HTML output?
- The library itself should be isolated by default and should just work as long as I import it into my code base.

With the release of react hooks, this problem now becomes easier to resolve. And here is my first headless ui react audio player component, it was a part of my personal project.

The implementation is quite simple since it took me around 2 hours to complete, but the typescript part took me 2 days and unresolved yet. I will get back to typescript sucks issue later.

For quick view the demo with awesome songs from Attack on Titan: https://stackblitz.com/edit/react-1ym6yv?file=src/App.js

## Basic

The only required props is source of audio list. The only requirement for using is adding `{...getAudioProps()}` as props to your `<audio>` component.

```
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

const App = () => {
	const { getAudioProps } = useSAudioPlayer({ audioList });

	return (
		<div>
			<audio {...getAudioProps()} />
		</div>
	)
}
```

## With your custom controls

Just use the `playerState` to determine the audio playing status, and the `getControlsProps` exposes all methods for your custom control like play, pause, prev, next, shuffle, change loop mode.

```
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

const App = () => {
	const {
    getAudioProps,
    getControlsProps,
    playerState
  } = useSAudioPlayer({ audioList });
  const { isPlay, isShuffled, loopMode, audioItem } = playerState;
  const {
    onPlay,
    onPrev,
    onNext,
    onShuffle,
    onChangeLoopMode
  } = getControlsProps();

	return (
		<div>
      <button onClick={onChangeLoopMode}>Loop</button>
      <button onClick={onPrev}>Prev</button>
      <button onClick={onPlay}>{isPlay ? 'Pause' : 'Play'}</button>
      <button onClick={onNext}>Next</button>
      <button onClick={onShuffle}>Shuffle</button>
			<audio {...getAudioProps()} controls />
		</div>
	)
}
```

## API

The types for all inputs are quite simple as below

```
interface SAudioPlayerAudioItem {
  src: string;
  name: string;
  artistName: string;
  image: string;
}

enum SAudioPlayerLoopMode {
  None = "none",
  All = "all",
  One = "one",
}

interface SAudioPlayerConfigs {
  shuffle?: boolean;
  loopMode?: SAudioPlayerLoopMode;
}

interface SAudioPlayerInputs {
  audioList: SAudioPlayerAudioItem[];
  index?: number;
  configs?: SAudioPlayerConfigs;
}

// Using
useSAudioPlayer(inputs: SAudioPlayerInputs)
```
