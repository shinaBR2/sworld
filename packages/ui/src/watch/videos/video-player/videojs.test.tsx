import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { VideoJS } from './videojs';
import { useVideoProgress } from 'core/watch/mutation-hooks/use-video-progress';
import { useAuthContext } from 'core/providers/auth';
import { PlayableVideo } from '../types';
import { getVideoPlayerOptions } from './utils';

// Create mockPlayer outside the mock scope
const mockPlayer = {
  on: vi.fn(),
  dispose: vi.fn(),
  isDisposed: vi.fn(() => false),
  currentTime: vi.fn(() => 10),
  autoplay: vi.fn(),
  src: vi.fn(),
};

vi.mock('video.js', () => {
  return {
    __esModule: true,
    default: vi.fn((_, __, callback) => {
      if (callback) {
        // Execute callback in next tick to ensure proper initialization
        Promise.resolve().then(() => callback());
      }
      return mockPlayer;
    }),
    log: vi.fn(),
  };
});

vi.mock('core/watch/mutation-hooks/use-video-progress');
vi.mock('core/providers/auth');

vi.mock('./utils', () => ({
  getVideoPlayerOptions: vi.fn((video, baseOptions) => ({
    techOrder: ['html5'],
    sources: [{ type: 'video/mp4', src: video.source }],
    ...baseOptions,
  })),
}));

const mockHandlers = {
  handleProgress: vi.fn(),
  handlePlay: vi.fn(),
  handlePause: vi.fn(),
  handleSeek: vi.fn(),
  handleEnded: vi.fn(),
  cleanup: vi.fn(),
};

describe('VideoJS', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    vi.mocked(useVideoProgress).mockReturnValue({
      ...mockHandlers,
    });

    vi.mocked(useAuthContext).mockReturnValue({
      getAccessToken: vi.fn(),
    } as unknown as ReturnType<typeof useAuthContext>);
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('should initialize video.js player', async () => {
    const props = {
      video: { id: '123', source: 'test.mp4' } as PlayableVideo,
      videoJsOptions: { autoplay: true },
    };

    render(<VideoJS {...props} />);

    await vi.waitFor(() => {
      expect(mockPlayer.on).toHaveBeenCalled();
    });

    expect(mockPlayer.on).toHaveBeenCalledWith('play', expect.any(Function));
    expect(mockPlayer.on).toHaveBeenCalledWith('timeupdate', expect.any(Function));
    expect(mockPlayer.on).toHaveBeenCalledWith('seeked', expect.any(Function));
    expect(mockPlayer.on).toHaveBeenCalledWith('pause', expect.any(Function));
    expect(mockPlayer.on).toHaveBeenCalledWith('ended', expect.any(Function));
  });

  it('should call cleanup function on unmount', () => {
    // With the separate useEffect(cleanup, []) implementation,
    // we only need to test that cleanup is called on unmount
    const props = {
      video: { id: '123', source: 'test.mp4' } as PlayableVideo,
      videoJsOptions: {},
    };

    // Reset cleanup mock before rendering
    mockHandlers.cleanup.mockReset();

    const { unmount } = render(<VideoJS {...props} />);

    // Reset cleanup mock again to ensure we only capture the unmount call
    mockHandlers.cleanup.mockReset();

    // Unmount component
    unmount();

    // With the separate useEffect(cleanup, []),
    // cleanup should be called directly on unmount
    expect(mockHandlers.cleanup).toHaveBeenCalled();
  });

  it('should handle player events', async () => {
    const props = {
      video: { id: '123', source: 'test.mp4' } as PlayableVideo,
      videoJsOptions: {},
    };

    render(<VideoJS {...props} />);
    await vi.waitFor(() => {
      expect(mockPlayer.on).toHaveBeenCalled();
    });

    const callbacks = mockPlayer.on.mock.calls.reduce((acc: any, [event, callback]) => {
      acc[event] = callback;
      return acc;
    }, {});

    callbacks['play']();
    expect(mockHandlers.handlePlay).toHaveBeenCalled();

    callbacks['timeupdate']();
    expect(mockHandlers.handleProgress).toHaveBeenCalledWith({ playedSeconds: 10 });
  });

  it('should memoize player options correctly', async () => {
    const props = {
      video: { id: '123', source: 'test.mp4' } as PlayableVideo,
      videoJsOptions: { autoplay: true },
    };

    const { rerender } = render(<VideoJS {...props} />);
    await vi.waitFor(() => expect(getVideoPlayerOptions).toHaveBeenCalledTimes(1));

    // Update source trigger
    rerender(<VideoJS {...props} video={{ ...props.video, source: 'new.mp4' }} />);
    await vi.waitFor(() => expect(getVideoPlayerOptions).toHaveBeenCalledTimes(2));
  });

  it('should call onEnded callback when video ends', async () => {
    const onEnded = vi.fn();
    const props = {
      video: { id: '123', source: 'test.mp4' } as PlayableVideo,
      videoJsOptions: {},
      onEnded,
    };

    render(<VideoJS {...props} />);
    await vi.waitFor(() => {
      expect(mockPlayer.on).toHaveBeenCalled();
    });

    // Get the ended callback
    const callbacks = mockPlayer.on.mock.calls.reduce((acc: any, [event, callback]) => {
      acc[event] = callback;
      return acc;
    }, {});

    // Simulate video end
    callbacks['ended']();

    // Should call both the internal handler and the provided callback
    expect(mockHandlers.handleEnded).toHaveBeenCalled();
    expect(onEnded).toHaveBeenCalled();
  });
});
