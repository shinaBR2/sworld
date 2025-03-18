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
    source: 'https://example.com/video.mp4',
  };

  it('should render VideoPlayer with correct props', () => {
    const mockOnError = vi.fn();
    render(<VideoContainer video={mockVideo} onError={mockOnError} />);

    expect(VideoPlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        video: mockVideo,
      }),
      expect.any(Object)
    );
  });
});
