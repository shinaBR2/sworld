import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoPlayer } from './index';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';

// Mock VideoThumbnail component
vi.mock('../video-thumbnail', () => ({
  VideoThumbnail: ({ title }: { title: string }) => (
    <div data-testid="video-thumbnail" title={title}>
      Thumbnail for {title}
    </div>
  ),
}));

const MockReactPlayer = vi.fn(({ url, light }) => (
  <div data-testid="mock-react-player" data-url={url} data-thumbnail={light}>
    Mock Player Content
  </div>
));

vi.mock('react-player', () => {
  return {
    __esModule: true,
    default: (props: unknown) => MockReactPlayer(props),
  };
});

const mockVideo = {
  id: 'video-123',
  title: 'Test Video',
  source: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  user: {
    username: 'master',
  },
};

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render player with correct props', async () => {
    render(<VideoPlayer video={mockVideo} />);

    // Initially should show loading state (VideoThumbnail)
    expect(screen.getByTestId('video-thumbnail')).toBeInTheDocument();

    // Wait for player to load
    const player = await screen.findByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', mockVideo.source);
    expect(player).toHaveAttribute('data-thumbnail', mockVideo.thumbnailUrl);
  });

  it('should use default thumbnail when thumbnailUrl is not provided', async () => {
    const videoWithoutThumbnail = {
      ...mockVideo,
      thumbnailUrl: undefined,
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    render(<VideoPlayer video={videoWithoutThumbnail} />);

    const player = await screen.findByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-thumbnail', defaultThumbnailUrl);
  });

  it('should handle player errors', async () => {
    const mockError = new Error('Playback failed');
    const onError = vi.fn();

    // Reset mock to capture onError prop
    MockReactPlayer.mockImplementationOnce(props => {
      // Immediately call onError to simulate error
      props.onError?.(mockError);

      return <div data-testid="mock-react-player">Mock Player Content</div>;
    });

    render(<VideoPlayer video={mockVideo} onError={onError} />);

    // Wait for player to load and error to be handled
    await screen.findByTestId('mock-react-player');
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should not crash when onError is not provided', async () => {
    const mockError = new Error('Playback failed');

    // Reset mock to simulate error without onError prop
    MockReactPlayer.mockImplementationOnce(props => {
      // This should not throw
      props.onError?.(mockError);

      return <div data-testid="mock-react-player">Mock Player Content</div>;
    });

    // Should not throw when rendered without onError prop
    expect(() => {
      render(<VideoPlayer video={mockVideo} />);
    }).not.toThrow();

    await screen.findByTestId('mock-react-player');
  });
});
