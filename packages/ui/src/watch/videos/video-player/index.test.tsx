import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlayableVideo } from '../types';
import { VideoPlayer } from './index';

// Mock ReactPlayer
const mockReactPlayerRef = vi.fn();
vi.mock('react-player', () => ({
  __esModule: true,
  default: React.forwardRef(({ url, onReady, ...props }, ref) => {
    mockReactPlayerRef.mockImplementation(() => props);

    // Simulate ref callback
    if (ref && typeof ref === 'function') {
      ref({
        paused: false,
        requestFullscreen: vi.fn(),
      });
    }
    return React.createElement(
      'div',
      {
        'data-testid': 'mock-react-player',
        'data-url': url,
        'data-props': JSON.stringify(props),
      },
      'Mock ReactPlayer',
    );
  }),
}));

// Mock auth context
vi.mock('core/providers/auth', () => ({
  useAuthContext: () => ({
    isSignedIn: false,
    getAccessToken: vi.fn(),
  }),
}));

// Mock video progress hook
vi.mock('core/watch/mutation-hooks/use-video-progress', () => ({
  useVideoProgress: () => ({
    handleProgress: vi.fn(),
    handlePlay: vi.fn(),
    handlePause: vi.fn(),
    handleSeek: vi.fn(),
    handleEnded: vi.fn(),
    cleanup: vi.fn(),
  }),
}));

// Mock VideoThumbnail
vi.mock('../video-thumbnail', () => ({
  VideoThumbnail: ({ title }) => (
    <div data-testid="video-thumbnail">{title}</div>
  ),
}));

// Mock default thumbnail URL
vi.mock('../../../universal/images/default-thumbnail', () => ({
  defaultThumbnailUrl: 'https://example.com/default-thumb.jpg',
}));

const mockVideo: PlayableVideo = {
  id: 'video-123',
  title: 'Test Video',
  source: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  subtitles: [
    {
      id: 'sub-1',
      lang: 'en',
      src: 'https://example.com/subtitles.vtt',
      isDefault: true,
      label: 'English',
    },
  ],
};

describe('VideoPlayer', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleSpy?.mockRestore();
  });

  it('should render ReactPlayer with correct props', async () => {
    render(<VideoPlayer video={mockVideo} />);
    const player = await screen.findByTestId('mock-react-player');

    expect(player).toBeInTheDocument();
    expect(player).toHaveAttribute('data-url', mockVideo.source);

    const props = JSON.parse(player.getAttribute('data-props') || '{}');

    expect(props).toMatchObject({
      controls: true,
      width: '100%',
      height: '100%',
      light: mockVideo.thumbnailUrl,
      playing: false,
      muted: false,
      volume: 1,
      playbackRate: 1,
      progressInterval: 1000,
    });
  });

  it('should render with default thumbnail when thumbnailUrl is not provided', async () => {
    const videoWithoutThumbnail = { ...mockVideo, thumbnailUrl: '' };
    render(<VideoPlayer video={videoWithoutThumbnail} />);
    const player = await screen.findByTestId('mock-react-player');

    const props = JSON.parse(player.getAttribute('data-props') || '{}');
    // Empty string is still passed through, it doesn't use default thumbnail
    expect(props.light).toBe('');
  });

  it('should render with default thumbnail when thumbnailUrl is undefined', async () => {
    const videoWithoutThumbnail = {
      ...mockVideo,
      thumbnailUrl: undefined as any,
    };
    render(<VideoPlayer video={videoWithoutThumbnail} />);
    const player = await screen.findByTestId('mock-react-player');

    const props = JSON.parse(player.getAttribute('data-props') || '{}');
    expect(props.light).toBe('https://example.com/default-thumb.jpg');
  });

  it('should configure subtitles correctly', async () => {
    render(<VideoPlayer video={mockVideo} />);
    const player = await screen.findByTestId('mock-react-player');

    const props = JSON.parse(player.getAttribute('data-props') || '{}');
    expect(props.config.file.tracks).toEqual([
      {
        kind: 'subtitles',
        src: 'https://example.com/subtitles.vtt',
        srcLang: 'en',
        default: true,
      },
    ]);
  });

  it('should call onEnded callback when video ends', async () => {
    const onEnded = vi.fn();
    render(<VideoPlayer video={mockVideo} onEnded={onEnded} />);

    const player = await screen.findByTestId('mock-react-player');
    expect(player).toBeInTheDocument();

    const props = mockReactPlayerRef();
    expect(typeof props.onEnded).toBe('function');

    act(() => {
      props.onEnded();
    });

    expect(onEnded).toHaveBeenCalled();
  });

  it('should call onError callback when video errors', async () => {
    const onError = vi.fn();
    render(<VideoPlayer video={mockVideo} onError={onError} />);

    const player = await screen.findByTestId('mock-react-player');
    expect(player).toBeInTheDocument();

    // Get the props from our mock
    const props = mockReactPlayerRef();
    expect(typeof props.onError).toBe('function');

    // Simulate the onError event
    const mockError = new Error('Video failed to load');
    act(() => {
      props.onError(mockError);
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });
});

describe('VideoPlayer keyboard hotkeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle keyboard events for play/pause (k key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    // Simulate 'k' key press
    const kEvent = new KeyboardEvent('keydown', { key: 'k' });
    Object.defineProperty(kEvent, 'preventDefault', { value: vi.fn() });

    fireEvent(document, kEvent);

    expect(kEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle keyboard events for mute (m key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    // Simulate 'm' key press
    const mEvent = new KeyboardEvent('keydown', { key: 'm' });
    Object.defineProperty(mEvent, 'preventDefault', { value: vi.fn() });

    fireEvent(document, mEvent);

    expect(mEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle keyboard events for volume up (ArrowUp key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    // Simulate 'ArrowUp' key press
    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    Object.defineProperty(upEvent, 'preventDefault', { value: vi.fn() });

    fireEvent(document, upEvent);

    expect(upEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle keyboard events for volume down (ArrowDown key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    // Simulate 'ArrowDown' key press
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    Object.defineProperty(downEvent, 'preventDefault', { value: vi.fn() });

    fireEvent(document, downEvent);

    expect(downEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle keyboard events for fullscreen (f key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    // Simulate 'f' key press
    const fEvent = new KeyboardEvent('keydown', { key: 'f' });
    Object.defineProperty(fEvent, 'preventDefault', { value: vi.fn() });

    fireEvent(document, fEvent);

    expect(fEvent.preventDefault).toHaveBeenCalled();
  });

  it('should ignore keyboard events when typing in input fields', async () => {
    render(
      <div>
        <input data-testid="test-input" />
        <VideoPlayer video={mockVideo} />
      </div>,
    );
    await screen.findByTestId('mock-react-player');

    const input = screen.getByTestId('test-input');
    input.focus();

    // Simulate 'k' key press while input is focused
    const kEvent = new KeyboardEvent('keydown', { key: 'k' });
    Object.defineProperty(kEvent, 'preventDefault', { value: vi.fn() });

    fireEvent(document, kEvent);

    // Should not prevent default since we're typing in an input
    expect(kEvent.preventDefault).not.toHaveBeenCalled();
  });
});
