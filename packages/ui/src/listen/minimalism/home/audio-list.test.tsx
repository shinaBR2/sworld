import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

// A stateful fake of useSAudioPlayer: `onSelect(flat)` moves the current track,
// `onPlay` toggles playback — matching the real hook's output contract
// (audioItem is the track at the selected flat position). This lets us test
// audio-list's one-way URL mirror deterministically, without the audio element
// or the build pipeline.
vi.mock('core', () => ({
  default: {
    useSAudioPlayer: ({ audioList }: { audioList: { id: string }[] }) => {
      const [index, setIndex] = useState(0);
      const [playing, setPlaying] = useState(false);

      return {
        getAudioProps: () => ({}),
        getSeekerProps: () => ({}),
        getControlsProps: () => ({
          onPlay: () => setPlaying((p) => !p),
          onPrev: () => {},
          onNext: () => {},
          onShuffle: () => {},
          onChangeLoopMode: () => {},
          onSelect: (flat: number) => setIndex(flat),
        }),
        playerState: {
          isPlay: playing,
          audioItem: audioList[index] ?? null,
          currentIndex: index,
        },
      };
    },
  },
}));

// Mobile so the lazy PlayingList stays out of the tree; the always-rendered
// MusicWidget exposes a "play" control plus a select button per track.
vi.mock('../../../universal/responsive', () => ({ useIsMobile: () => true }));
vi.mock('../music-widget', () => ({
  default: ({
    audioList,
    hookResult,
    onItemSelect,
  }: {
    audioList: { id: string }[];
    hookResult: { getControlsProps: () => { onPlay: () => void } };
    onItemSelect: (id: string) => void;
  }) => (
    <div>
      <button type="button" onClick={hookResult.getControlsProps().onPlay}>
        play
      </button>
      {audioList.map((a) => (
        <button key={a.id} type="button" onClick={() => onItemSelect(a.id)}>
          select-{a.id}
        </button>
      ))}
    </div>
  ),
}));
vi.mock('../music-widget/music-widget-skeleton', () => ({
  MusicWidgetSkeleton: () => <div>skeleton</div>,
}));

import { AudioList } from './audio-list';

const audios = [
  { id: 'a', source: '', thumbnailUrl: '', name: 'A', artistName: 'x' },
  { id: 'b', source: '', thumbnailUrl: '', name: 'B', artistName: 'x' },
  { id: 'c', source: '', thumbnailUrl: '', name: 'C', artistName: 'x' },
];

const setup = (activeAudioId: string) => {
  const onAudioChange = vi.fn();
  render(
    <AudioList
      queryRs={{ isLoading: false }}
      list={audios}
      activeFeelingId=""
      activeAudioId={activeAudioId}
      onAudioChange={onAudioChange}
    />,
  );

  return onAudioChange;
};

const play = () =>
  fireEvent.click(screen.getByRole('button', { name: 'play' }));
const select = (id: string) =>
  fireEvent.click(screen.getByRole('button', { name: `select-${id}` }));

describe('AudioList URL mirror', () => {
  it('keeps a clean URL on load until the user plays', () => {
    const onAudioChange = setup('');

    expect(onAudioChange).not.toHaveBeenCalled();
  });

  it('mirrors the default track once playback starts', () => {
    const onAudioChange = setup('');

    play();

    expect(onAudioChange).toHaveBeenCalledWith('a');
  });

  it('mirrors a picked track (selecting also plays)', () => {
    const onAudioChange = setup('');

    select('b');

    expect(onAudioChange).toHaveBeenCalledWith('b');
  });

  it('does not re-write a matching deep link when it plays', () => {
    const onAudioChange = setup('b');

    play();

    expect(onAudioChange).not.toHaveBeenCalled();
  });

  it('corrects a stale deep-link id to the actual track on play', () => {
    const onAudioChange = setup('does-not-exist');

    play();

    expect(onAudioChange).toHaveBeenCalledWith('a');
  });
});
