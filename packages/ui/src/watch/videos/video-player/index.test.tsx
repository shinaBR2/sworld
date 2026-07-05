import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlayableVideo } from '../types';
import { VideoPlayer } from './index';

// Mock ReactPlayer
const mockReactPlayerRef = vi.fn();
const mockGetCurrentTime = vi.fn(() => 10); // Mock current time at 10 seconds
const mockGetDuration = vi.fn(() => 100); // Mock duration at 100 seconds
const mockSeekTo = vi.fn();

vi.mock('react-player', () => ({
  __esModule: true,
  default: React.forwardRef(({ url, ...props }, ref) => {
    mockReactPlayerRef.mockImplementation(() => props);

    // Simulate ref callback
    if (ref && typeof ref === 'function') {
      ref({
        paused: false,
        requestFullscreen: vi.fn(),
        getCurrentTime: mockGetCurrentTime,
        getDuration: mockGetDuration,
        seekTo: mockSeekTo,
        wrapper: document.createElement('div'), // Mock wrapper element for fullscreen
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

describe('VideoPlayer resume from saved progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDuration.mockReturnValue(100);
  });

  it('seeks to the saved position (minus a short rewind) on ready', async () => {
    render(<VideoPlayer video={{ ...mockVideo, progressSeconds: 50 }} />);
    await screen.findByTestId('mock-react-player');
    const props = mockReactPlayerRef();

    act(() => {
      props.onReady();
    });

    // 50 saved - 5s rewind
    expect(mockSeekTo).toHaveBeenCalledWith(45, 'seconds');
  });

  it('does not seek when there is no saved progress', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');
    const props = mockReactPlayerRef();

    act(() => {
      props.onReady();
    });

    expect(mockSeekTo).not.toHaveBeenCalled();
  });

  it('does not resume when the saved position is at/near the end', async () => {
    // duration 100, threshold 10 → anything >= 90 is treated as finished
    render(<VideoPlayer video={{ ...mockVideo, progressSeconds: 95 }} />);
    await screen.findByTestId('mock-react-player');
    const props = mockReactPlayerRef();

    act(() => {
      props.onReady();
    });

    expect(mockSeekTo).not.toHaveBeenCalled();
  });

  it('resumes only once even if ready fires repeatedly', async () => {
    render(<VideoPlayer video={{ ...mockVideo, progressSeconds: 50 }} />);
    await screen.findByTestId('mock-react-player');
    const props = mockReactPlayerRef();

    act(() => {
      props.onReady();
      props.onReady();
    });

    expect(mockSeekTo).toHaveBeenCalledTimes(1);
  });
});

describe('VideoPlayer keyboard hotkeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations for each test
    mockGetCurrentTime.mockReturnValue(10);
    mockGetDuration.mockReturnValue(100);
  });

  // Dispatches a keydown from `target` and returns the event (with a spied
  // preventDefault). Wrapped in act so the document-listener's setState flushes.
  const pressKey = (target: HTMLElement, key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    act(() => {
      fireEvent(target, event);
    });
    return event;
  };

  it('toggles play/pause page-wide (k key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');
    expect(mockReactPlayerRef().playing).toBe(false);

    // Dispatch on document.body (the wrapper is never focused) — the listener is
    // document-level, so the shortcut fires regardless of focus AND the player
    // actually starts playing.
    const event = pressKey(document.body, 'k');

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockReactPlayerRef().playing).toBe(true);
  });

  it('toggles mute page-wide (m key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');
    expect(mockReactPlayerRef().muted).toBe(false);

    const event = pressKey(document.body, 'm');

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockReactPlayerRef().muted).toBe(true);
  });

  it('lowers the volume page-wide (ArrowDown key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');
    expect(mockReactPlayerRef().volume).toBe(1);

    const event = pressKey(document.body, 'ArrowDown');

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockReactPlayerRef().volume).toBeCloseTo(0.95);
  });

  it('raises the volume page-wide (ArrowUp key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    // Volume starts maxed (1), so drop it twice first, then ArrowUp raises it.
    pressKey(document.body, 'ArrowDown');
    pressKey(document.body, 'ArrowDown');
    expect(mockReactPlayerRef().volume).toBeCloseTo(0.9);

    const event = pressKey(document.body, 'ArrowUp');

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockReactPlayerRef().volume).toBeCloseTo(0.95);
  });

  it('lets modifier combos (e.g. Cmd/Ctrl+F) through to the browser', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    // Ctrl+F must not be swallowed as the fullscreen hotkey — the browser find
    // bar should still open.
    const event = new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true,
      bubbles: true,
    });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    act(() => {
      fireEvent(document.body, event);
    });

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('handles the fullscreen key page-wide (f key)', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    const event = pressKey(document.body, 'f');

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('exits fullscreen with f when the player video is fullscreen', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    // Native controls fullscreen the <video> element (a descendant of the
    // wrapper), not the wrapper itself — the `f` hotkey must still exit it.
    const descendant = screen.getByTestId('mock-react-player');
    const exitFullscreen = vi.fn();
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    });
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => descendant,
    });

    pressKey(document.body, 'f');

    expect(exitFullscreen).toHaveBeenCalled();

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => null,
    });
  });

  it('ignores shortcuts when a native summary element is the target', async () => {
    render(
      <div>
        <details>
          <summary data-testid="test-summary">More</summary>
          <p>Details</p>
        </details>
        <VideoPlayer video={mockVideo} />
      </div>,
    );
    await screen.findByTestId('mock-react-player');

    // Space on a <summary> must expand the <details>, not toggle the video.
    const event = pressKey(screen.getByTestId('test-summary'), ' ');

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockReactPlayerRef().playing).toBe(false);
  });

  it('does not throw when the keydown target is not an element', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-react-player');

    // A keydown dispatched on the document node (no closest()/isContentEditable)
    // must be handled gracefully by the guard rather than throwing.
    expect(() =>
      pressKey(document as unknown as HTMLElement, 'k'),
    ).not.toThrow();
  });

  it('ignores shortcuts when a focused dialog is the target', async () => {
    render(
      <div>
        <div role="dialog" aria-modal="true" data-testid="test-dialog">
          <span data-testid="test-dialog-content">Content</span>
        </div>
        <VideoPlayer video={mockVideo} />
      </div>,
    );
    await screen.findByTestId('mock-react-player');

    // A key pressed inside an open dialog over the video must not reach the
    // video behind it.
    const event = pressKey(screen.getByTestId('test-dialog-content'), ' ');

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockReactPlayerRef().playing).toBe(false);
  });

  it('ignores shortcuts typed into an input', async () => {
    render(
      <div>
        <input data-testid="test-input" />
        <VideoPlayer video={mockVideo} />
      </div>,
    );
    await screen.findByTestId('mock-react-player');

    // 'k' from the input must be skipped — no preventDefault, and the player
    // does not start playing.
    const event = pressKey(screen.getByTestId('test-input'), 'k');

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockReactPlayerRef().playing).toBe(false);
  });

  it('ignores shortcuts typed into a textarea', async () => {
    render(
      <div>
        <textarea data-testid="test-textarea" />
        <VideoPlayer video={mockVideo} />
      </div>,
    );
    await screen.findByTestId('mock-react-player');

    const event = pressKey(screen.getByTestId('test-textarea'), 'k');

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockReactPlayerRef().playing).toBe(false);
  });

  it('ignores shortcuts typed into a contenteditable element', async () => {
    render(
      <div>
        <div
          data-testid="test-editable"
          contentEditable
          suppressContentEditableWarning
        />
        <VideoPlayer video={mockVideo} />
      </div>,
    );
    await screen.findByTestId('mock-react-player');

    const editable = screen.getByTestId('test-editable');
    // jsdom does not derive isContentEditable from the attribute, so set it
    // explicitly to mirror a real browser's editable target.
    Object.defineProperty(editable, 'isContentEditable', { value: true });

    const event = pressKey(editable, 'k');

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockReactPlayerRef().playing).toBe(false);
  });

  it('ignores shortcuts when a focusable control is the target', async () => {
    render(
      <div>
        <button type="button" data-testid="test-button">
          Add to list
        </button>
        <VideoPlayer video={mockVideo} />
      </div>,
    );
    await screen.findByTestId('mock-react-player');

    // Space/typing on a focused button must activate the button, not toggle the
    // video — the interactive-target guard leaves the event untouched.
    const event = pressKey(screen.getByTestId('test-button'), ' ');

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockReactPlayerRef().playing).toBe(false);
  });

  it('ignores shortcuts bubbling from inside a focusable control', async () => {
    render(
      <div>
        <button type="button">
          <span data-testid="test-button-child">Label</span>
        </button>
        <VideoPlayer video={mockVideo} />
      </div>,
    );
    await screen.findByTestId('mock-react-player');

    // Event target is the inner <span>, not the button — closest() must still
    // find the enclosing control and skip the shortcut.
    const event = pressKey(screen.getByTestId('test-button-child'), 'k');

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockReactPlayerRef().playing).toBe(false);
  });
});
