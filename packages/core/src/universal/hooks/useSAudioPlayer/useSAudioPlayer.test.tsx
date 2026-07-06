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
  const { getAudioProps, playerState } = useSAudioPlayer({
    audioList,
    index: props.index,
    configs: { loopMode: props.loopMode },
  });

  return (
    <div>
      <audio {...getAudioProps()} data-testid="audio" />
      <span data-testid="index">{playerState.currentIndex}</span>
      <span data-testid="isPlay">{String(playerState.isPlay)}</span>
    </div>
  );
};

const endTrack = (loopMode: SAudioPlayerLoopMode, index: number) => {
  const view = render(<Harness loopMode={loopMode} index={index} />);
  fireEvent.ended(view.getByTestId('audio'));

  return {
    index: Number(view.getByTestId('index').textContent),
    isPlay: view.getByTestId('isPlay').textContent === 'true',
  };
};

describe('useSAudioPlayer onEnded', () => {
  describe('loopMode None', () => {
    it('advances to the next audio and keeps playing mid-list', () => {
      expect(endTrack(SAudioPlayerLoopMode.None, 0)).toEqual({
        index: 1,
        isPlay: true,
      });
    });

    it('stops without wrapping when the last audio ends', () => {
      expect(endTrack(SAudioPlayerLoopMode.None, 2)).toEqual({
        index: 2,
        isPlay: false,
      });
    });
  });

  describe('loopMode All', () => {
    it('wraps back to the first audio and keeps playing', () => {
      expect(endTrack(SAudioPlayerLoopMode.All, 2)).toEqual({
        index: 0,
        isPlay: true,
      });
    });
  });

  describe('loopMode One', () => {
    it('keeps the same audio and keeps playing', () => {
      expect(endTrack(SAudioPlayerLoopMode.One, 1)).toEqual({
        index: 1,
        isPlay: true,
      });
    });
  });
});
