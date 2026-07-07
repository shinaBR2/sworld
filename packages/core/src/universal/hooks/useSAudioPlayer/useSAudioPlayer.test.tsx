import { fireEvent, render } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import useSAudioPlayer, {
  type SAudioPlayerAudioItem,
  SAudioPlayerLoopMode,
} from './useSAudioPlayer';

const audioList: SAudioPlayerAudioItem[] = [
  { id: '1', src: 'a.mp3', name: 'A', image: '', artistName: 'x' },
  { id: '2', src: 'b.mp3', name: 'B', image: '', artistName: 'x' },
  { id: '3', src: 'c.mp3', name: 'C', image: '', artistName: 'x' },
];

// jsdom doesn't implement media playback; stub it so the play tail (which
// runs only when the internal ref is attached) doesn't throw.
beforeAll(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

// Mount the <audio> element so the hook's ref is non-null and onEnded reaches
// the setPlay/playAudio tail — renderHook alone leaves ref.current null and
// short-circuits before it, so playback state would never be exercised.
const Harness = (props: { loopMode: SAudioPlayerLoopMode; index: number }) => {
  const { getAudioProps, getControlsProps, playerState } = useSAudioPlayer({
    audioList,
    index: props.index,
    configs: { loopMode: props.loopMode },
  });

  return (
    <div>
      <audio {...getAudioProps()} data-testid="audio" />
      <button
        type="button"
        data-testid="play"
        onClick={getControlsProps().onPlay}
      >
        play
      </button>
      <span data-testid="index">{playerState.currentIndex}</span>
      <span data-testid="isPlay">{String(playerState.isPlay)}</span>
    </div>
  );
};

interface EndTrackOptions {
  loopMode: SAudioPlayerLoopMode;
  index: number;
  // Start from a playing state so a stop (isPlay true -> false) is a real
  // transition rather than the never-played initial value.
  startPlaying?: boolean;
}

const endTrack = ({ loopMode, index, startPlaying }: EndTrackOptions) => {
  const view = render(<Harness loopMode={loopMode} index={index} />);
  if (startPlaying) {
    fireEvent.click(view.getByTestId('play'));
  }
  fireEvent.ended(view.getByTestId('audio'));

  return {
    index: Number(view.getByTestId('index').textContent),
    isPlay: view.getByTestId('isPlay').textContent === 'true',
  };
};

// `playerState.currentIndex` is a flat position in `audioList`, and so is the
// `index` input — these tests pin that contract across the shuffle permutation,
// which is where the two used to diverge.
const SelectHarness = (props: { index: number }) => {
  const { getControlsProps, playerState } = useSAudioPlayer({
    audioList,
    index: props.index,
  });

  return (
    <div>
      <button
        type="button"
        data-testid="shuffle"
        onClick={getControlsProps().onShuffle}
      >
        shuffle
      </button>
      <span data-testid="index">{playerState.currentIndex}</span>
    </div>
  );
};

// A variant that can change its `audioList`, to exercise the list being
// filtered/rebuilt underneath the player.
const ResizeHarness = (props: {
  list: SAudioPlayerAudioItem[];
  index: number;
}) => {
  const { getControlsProps, playerState } = useSAudioPlayer({
    audioList: props.list,
    index: props.index,
  });

  return (
    <div>
      <button
        type="button"
        data-testid="shuffle"
        onClick={getControlsProps().onShuffle}
      >
        shuffle
      </button>
      <span data-testid="track">{playerState.audioItem?.id ?? 'none'}</span>
    </div>
  );
};

describe('useSAudioPlayer track addressing', () => {
  it('selects the track at the given flat index while shuffled', () => {
    const view = render(<SelectHarness index={0} />);

    fireEvent.click(view.getByTestId('shuffle'));
    // Selecting flat index 2 must land on audioList[2] regardless of the
    // shuffled play order, not on whatever slot 2 happens to hold.
    view.rerender(<SelectHarness index={2} />);

    expect(view.getByTestId('index').textContent).toBe('2');
  });

  it('keeps the current track when shuffle is toggled on and off', () => {
    const view = render(<SelectHarness index={1} />);
    expect(view.getByTestId('index').textContent).toBe('1');

    fireEvent.click(view.getByTestId('shuffle')); // on
    expect(view.getByTestId('index').textContent).toBe('1');

    fireEvent.click(view.getByTestId('shuffle')); // off
    expect(view.getByTestId('index').textContent).toBe('1');
  });

  it('stays on a valid track when the list shrinks while shuffled', () => {
    const view = render(<ResizeHarness list={audioList} index={2} />);

    fireEvent.click(view.getByTestId('shuffle'));
    // Filter the list down to one track: the slot must be rebuilt in range,
    // not left pointing past the end of the now-shorter order (which would
    // null out the current track and stop playback).
    view.rerender(<ResizeHarness list={audioList.slice(0, 1)} index={0} />);

    expect(view.getByTestId('track').textContent).toBe('1');
  });
});

describe('useSAudioPlayer onEnded', () => {
  describe('loopMode None', () => {
    it('advances to the next audio and keeps playing mid-list', () => {
      expect(
        endTrack({ loopMode: SAudioPlayerLoopMode.None, index: 0 }),
      ).toEqual({ index: 1, isPlay: true });
    });

    it('stops without wrapping when the last audio ends', () => {
      expect(
        endTrack({
          loopMode: SAudioPlayerLoopMode.None,
          index: 2,
          startPlaying: true,
        }),
      ).toEqual({ index: 2, isPlay: false });
    });

    it('resumes the newly advanced track once its data loads', () => {
      const view = render(
        <Harness loopMode={SAudioPlayerLoopMode.None} index={0} />,
      );
      const audio = view.getByTestId('audio');

      fireEvent.ended(audio); // advances and marks the player as playing

      // The advance path defers playback to onLoadedData rather than replaying
      // the just-ended element, so the next track starts when its data loads.
      const play = vi.mocked(HTMLMediaElement.prototype.play);
      play.mockClear();
      fireEvent.loadedData(audio);

      expect(play).toHaveBeenCalledTimes(1);
    });
  });

  describe('loopMode All', () => {
    it('wraps back to the first audio and keeps playing', () => {
      expect(
        endTrack({ loopMode: SAudioPlayerLoopMode.All, index: 2 }),
      ).toEqual({
        index: 0,
        isPlay: true,
      });
    });
  });

  describe('loopMode One', () => {
    it('keeps the same audio and keeps playing', () => {
      expect(
        endTrack({ loopMode: SAudioPlayerLoopMode.One, index: 1 }),
      ).toEqual({
        index: 1,
        isPlay: true,
      });
    });
  });
});
