import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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

// Create a promise to control React.lazy loading
let resolveReactPlayer: (value: unknown) => void;
const reactPlayerPromise = new Promise(resolve => {
  resolveReactPlayer = resolve;
});

// Mock react-player with controlled lazy loading
vi.mock('react-player', () => {
  return {
    __esModule: true,
    default: ({ url, light, onError }: { url: string; light: string; onError: (error: unknown) => void }) => (
      <div
        data-testid="mock-react-player"
        data-url={url}
        data-thumbnail={light}
        onClick={() => onError && onError(new Error('Player error'))}
      >
        Mock Player Content
      </div>
    ),
  };
});

// Mock React.lazy to use our controlled promise
vi.mock('react', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    lazy: () => reactPlayerPromise,
  };
});

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

const mockVideo = {
  title: 'Test Video',
  source: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
};

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render player with correct props', async () => {
    render(<VideoPlayer video={mockVideo} />);

    // Resolve the lazy load
    await act(async () => {
      resolveReactPlayer({ default: await import('react-player').then(m => m.default) });
    });

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', mockVideo.source);
    expect(player).toHaveAttribute('data-thumbnail', mockVideo.thumbnailUrl);
  });

  it('should use default thumbnail when thumbnailUrl is not provided', async () => {
    const videoWithoutThumbnail = {
      ...mockVideo,
      thumbnailUrl: null,
    };

    render(<VideoPlayer video={videoWithoutThumbnail} />);

    await act(async () => {
      resolveReactPlayer({ default: await import('react-player').then(m => m.default) });
    });

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-thumbnail', defaultThumbnailUrl);
  });

  it('should handle player errors', async () => {
    render(<VideoPlayer video={mockVideo} />);

    await act(async () => {
      resolveReactPlayer({ default: await import('react-player').then(m => m.default) });
    });

    const player = screen.getByTestId('mock-react-player');

    // Trigger error by clicking (as defined in our mock)
    await act(async () => {
      player.click();
    });

    expect(mockConsoleError).toHaveBeenCalledWith('ReactPlayer Error:', expect.any(Error));
  });
});
