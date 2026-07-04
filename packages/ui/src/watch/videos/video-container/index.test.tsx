import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PlayableVideo } from '../types';
import { VideoPlayer } from '../video-player';
import { VideoContainer } from './index';

// No JSX inside the factory: Vitest 4 hoists vi.mock above the jsx-runtime
// import, so JSX here would reference an uninitialized module binding.
vi.mock('../video-player', () => ({
  VideoPlayer: vi.fn(() => null),
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
    render(
      <VideoContainer
        video={mockVideo}
        onError={mockOnError}
        onEnded={mockOnEnded}
      />,
    );

    expect(VideoPlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        video: mockVideo,
        onError: mockOnError,
        onEnded: mockOnEnded,
      }),
      expect.any(Object),
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
      expect.any(Object),
    );
  });
});
