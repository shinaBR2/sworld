import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { VideoContainer } from './index';
import { VideoPlayer } from '../video-player';
import { PlayableVideo } from '../types';

vi.mock('../video-player', () => ({
  VideoPlayer: vi.fn().mockReturnValue(<div data-testid="video-player" />),
}));

describe('VideoContainer', () => {
  const mockVideo: PlayableVideo = {
    id: '123',
    title: 'Test Video',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    source: 'https://example.com/video.mp4',
    subtitles: [
      {
        id: '1',
        label: 'English',
        lang: 'en',
        src: 'https://example.com/sub1.vtt',
        isDefault: true,
      },
    ],
  };

  it('should render VideoPlayer with all props', () => {
    const mockOnError = vi.fn();
    const mockOnEnded = vi.fn();
    render(<VideoContainer video={mockVideo} onError={mockOnError} onEnded={mockOnEnded} />);

    expect(VideoPlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        video: mockVideo,
        onError: mockOnError,
        onEnded: mockOnEnded,
      }),
      expect.any(Object)
    );
  });

  it('should render VideoPlayer without optional props', () => {
    render(<VideoContainer video={mockVideo} />);

    expect(VideoPlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        video: mockVideo,
        onError: undefined,
        onEnded: undefined,
      }),
      expect.any(Object)
    );
  });
});
