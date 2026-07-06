import { useEffect, useRef, useState } from 'react';
import { playAudio, seek } from './utils/actions';

export interface SAudioPlayerAudioItem {
  id: string;
  src: string;
  name: string;
  image: string;
  artistName: string;
}

export enum SAudioPlayerLoopMode {
  None = 'none',
  All = 'all',
  One = 'one',
}

interface SAudioPlayerConfigs {
  shuffle?: boolean;
  loopMode?: SAudioPlayerLoopMode;
}

export interface SAudioPlayerInputs {
  audioList: SAudioPlayerAudioItem[];
  index?: number;
  configs?: SAudioPlayerConfigs;
}

const useSAudioPlayer = (inputs: SAudioPlayerInputs) => {
  const { audioList, index = 0, configs = {} } = inputs;
  const { shuffle = false, loopMode: loop = SAudioPlayerLoopMode.All } =
    configs;

  const ref = useRef<HTMLAudioElement>(null);

  const [indexes, setIndexes] = useState<number[]>();
  const [currentIndex, setCurrentIndex] = useState<number>(index);

  const [isShuffled, setIsShuffled] = useState(shuffle);
  const [loopMode, setLoopMode] = useState(loop);

  const [isPlay, setPlay] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const total = audioList.length;
  const loopModes = ['all', 'one', 'none'];

  useEffect(() => {
    if (total) {
      const indexes = Array.from({ length: total }).map((_v, i) => i);

      setIndexes(indexes);
    }
  }, [total]);

  useEffect(() => {
    setCurrentIndex(index);
  }, [index]);

  useEffect(() => {
    setIsShuffled(shuffle);
  }, [shuffle]);

  useEffect(() => {
    setLoopMode(loop);
  }, [loop]);

  const firstIndex = 0;
  const lastIndex = indexes ? indexes?.length - 1 : 0;
  const isFirst = currentIndex === firstIndex;
  const isLast = currentIndex === lastIndex;

  const i = indexes ? indexes[currentIndex] : 0;
  const audioItem = audioList && indexes ? audioList[i] : null;
  const { src } = audioItem || {};

  // https://mui.com/material-ui/react-slider/#music-player
  const formatDuration = (value: number) => {
    const minute = Math.floor(value / 60);
    const secondLeft = Math.floor(value - minute * 60);
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  };

  const onLoadedData = () => {
    if (!ref.current) {
      return;
    }

    setDuration(Math.ceil(ref.current.duration));
    if (isPlay) {
      ref.current.play();
    }
  };

  const onTimeUpdate = () => {
    if (!ref.current) {
      return;
    }

    setCurrentTime(ref.current.currentTime);
  };

  const onSeek = (position: number) => {
    if (!ref.current) {
      return;
    }

    setCurrentTime(ref.current.currentTime);
    seek(ref.current, position);
  };

  const onEnded = () => {
    // One: the same track repeats. src doesn't change, so onLoadedData won't
    // refire — start playback on the current element directly.
    if (loopMode === SAudioPlayerLoopMode.One) {
      if (!ref.current) {
        return;
      }

      setPlay(true);
      playAudio(ref.current);

      return;
    }

    // End of the list: All wraps back to the start, None stops.
    if (isLast) {
      if (loopMode === SAudioPlayerLoopMode.None) {
        return setPlay(false);
      }

      setCurrentIndex(firstIndex);
    } else {
      // All and None both auto-advance to the next track mid-list.
      setCurrentIndex(currentIndex + 1);
    }

    // Advancing swaps src on the next render; onLoadedData resumes the new
    // track when isPlay is true. Don't call playAudio here — it would toggle
    // the just-ended element before the new src is committed.
    setPlay(true);
  };

  const onPlay = () => {
    if (!ref.current) {
      return;
    }

    setPlay(!isPlay);

    playAudio(ref.current);
  };

  const onPrev = () => {
    if (isFirst) {
      if (loopMode === SAudioPlayerLoopMode.All) {
        return setCurrentIndex(lastIndex);
      }

      return;
    }

    setCurrentIndex(currentIndex - 1);
  };

  const onNext = () => {
    if (isLast) {
      if (loopMode === SAudioPlayerLoopMode.All) {
        return setCurrentIndex(firstIndex);
      }

      return;
    }

    setCurrentIndex(currentIndex + 1);
  };

  const onShuffle = () => {
    if (!indexes) {
      return;
    }

    if (!isShuffled) {
      const sortFunc = () => (Math.random() > 0.5 ? 1 : -1);
      const newIndexes = [...indexes.sort(sortFunc)];
      const newCurrentIndex = newIndexes.findIndex((i) => i === currentIndex);

      setIndexes(newIndexes);
      setCurrentIndex(newCurrentIndex);
    }

    setIsShuffled(!isShuffled);
  };

  const onChangeLoopMode = () => {
    const index = loopModes.indexOf(loopMode);

    let newIndex;
    if (index === 2) {
      newIndex = 0;
    } else {
      newIndex = index + 1;
    }

    setLoopMode(loopModes[newIndex] as SAudioPlayerLoopMode);
  };

  const getAudioProps = () => {
    return {
      ref,
      src,
      onEnded,
      onLoadedData,
      onTimeUpdate,
    };
  };

  const getSeekerProps = () => {
    return {
      max: duration,
      position: currentTime,
      setPosition: onSeek,
      formatDuration,
    };
  };

  const getControlsProps = () => {
    return {
      onPlay,
      onPrev,
      onNext,
      onShuffle,
      onChangeLoopMode,
    };
  };

  return {
    getAudioProps,
    getSeekerProps,
    getControlsProps,
    playerState: {
      isPlay,
      isShuffled,
      loopMode,
      currentTime,
      audioItem,
      currentIndex: i,
    },
  };
};

export default useSAudioPlayer;
