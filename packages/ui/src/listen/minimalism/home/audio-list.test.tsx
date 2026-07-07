import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

// A stateful fake of useSAudioPlayer: `onSelect(flatIndex)` moves the current
// track, exactly like the real hook's output contract (audioItem is the track
// at the selected flat position). This lets us test audio-list's URL mirror
// deterministically, without the audio element or the build pipeline.
vi.mock('core', () => ({
  default: {
    useSAudioPlayer: ({ audioList }: { audioList: { id: string }[] }) => {
      const [index, setIndex] = useState(0);

      return {
        getAudioProps: () => ({}),
        getSeekerProps: () => ({}),
        getControlsProps: () => ({
          onPlay: () => {},
          onPrev: () => {},
          onNext: () => {},
          onShuffle: () => {},
          onChangeLoopMode: () => {},
          onSelect: (flat: number) => setIndex(flat),
        }),
        playerState: {
          isPlay: false,
          audioItem: audioList[index] ?? null,
          currentIndex: index,
        },
      };
    },
  },
}));

// Mobile so the lazy PlayingList stays out of the tree; the always-rendered
// MusicWidget exposes a select button per track instead.
vi.mock('../../../universal/responsive', () => ({ useIsMobile: () => true }));
vi.mock('../music-widget', () => ({
  default: ({
    audioList,
    onItemSelect,
  }: {
    audioList: { id: string }[];
    onItemSelect: (id: string) => void;
  }) => (
    <div>
      {audioList.map((a) => (
        <button key={a.id} type="button" onClick={() => onItemSelect(a.id)}>
          play-{a.id}
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

describe('AudioList URL mirror', () => {
  it('does not write the URL on a clean load', () => {
    const onAudioChange = setup('');

    expect(onAudioChange).not.toHaveBeenCalled();
  });

  it('mirrors the selected track to the URL when a track is picked', () => {
    const onAudioChange = setup('');

    fireEvent.click(screen.getByRole('button', { name: 'play-b' }));

    expect(onAudioChange).toHaveBeenCalledWith('b');
  });

  it('does not re-write the URL for a matching deep link', () => {
    const onAudioChange = setup('b');

    expect(onAudioChange).not.toHaveBeenCalled();
  });

  it('corrects a stale deep-link id to the actual track', () => {
    const onAudioChange = setup('does-not-exist');

    expect(onAudioChange).toHaveBeenCalledWith('a');
  });
});
