import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useSAudioPlayer, {
  type SAudioPlayerAudioItem,
  SAudioPlayerLoopMode,
} from './useSAudioPlayer';

const audioList: SAudioPlayerAudioItem[] = [
  { id: '1', src: 'a.mp3', name: 'A', image: '', artistName: 'x' },
  { id: '2', src: 'b.mp3', name: 'B', image: '', artistName: 'x' },
  { id: '3', src: 'c.mp3', name: 'C', image: '', artistName: 'x' },
];

const setup = (loopMode: SAudioPlayerLoopMode, index: number) =>
  renderHook(() =>
    useSAudioPlayer({ audioList, index, configs: { loopMode } }),
  );

describe('useSAudioPlayer onEnded', () => {
  describe('loopMode None', () => {
    it('auto-advances to the next audio when a track ends mid-list', () => {
      const { result } = setup(SAudioPlayerLoopMode.None, 0);

      act(() => {
        result.current.getAudioProps().onEnded();
      });

      expect(result.current.playerState.currentIndex).toBe(1);
    });

    it('stops without wrapping when the last audio ends', () => {
      const { result } = setup(SAudioPlayerLoopMode.None, 2);

      act(() => {
        result.current.getAudioProps().onEnded();
      });

      expect(result.current.playerState.currentIndex).toBe(2);
      expect(result.current.playerState.isPlay).toBe(false);
    });
  });

  describe('loopMode All', () => {
    it('wraps back to the first audio when the last audio ends', () => {
      const { result } = setup(SAudioPlayerLoopMode.All, 2);

      act(() => {
        result.current.getAudioProps().onEnded();
      });

      expect(result.current.playerState.currentIndex).toBe(0);
    });
  });

  describe('loopMode One', () => {
    it('keeps the same audio when a track ends', () => {
      const { result } = setup(SAudioPlayerLoopMode.One, 1);

      act(() => {
        result.current.getAudioProps().onEnded();
      });

      expect(result.current.playerState.currentIndex).toBe(1);
    });
  });
});
