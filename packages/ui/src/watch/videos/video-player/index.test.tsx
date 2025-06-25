import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { VideoPlayer } from './index';
import VideoJS from './videojs';
import { PlayableVideo } from '../types';

// Mock VideoJS component
vi.mock('./videojs', () => ({
  __esModule: true,
  default: vi.fn(({ video, videoJsOptions }) => (
    <div data-testid="mock-videojs" data-video-id={video.id} data-options={JSON.stringify(videoJsOptions)}>
      Mock VideoJS Player
    </div>
  )),
}));

const mockVideo = {
  id: 'video-123',
  title: 'Test Video',
  source: 'https://example.com/video.mp4',
  createdAt: '2024-01-01T00:00:00Z',
  user: {
    username: 'master',
  },
} as unknown as PlayableVideo;

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render VideoJS player with correct props', async () => {
    render(<VideoPlayer video={mockVideo} />);
    const player = await screen.findByTestId('mock-videojs');

    expect(player).toBeInTheDocument();
    expect(player).toHaveAttribute('data-video-id', mockVideo.id);

    const options = JSON.parse(player.getAttribute('data-options') || '{}');

    expect(options).toMatchObject({
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      aspectRatio: '16:9',
      html5: {
        vhs: {
          overrideNative: false,
        },
        nativeAudioTracks: true,
        nativeVideoTracks: false,
      },
    });

    const { videoJsOptions } = vi.mocked(VideoJS).mock.calls[0][0];
    expect(videoJsOptions.userActions?.hotkeys).toBeInstanceOf(Function);
  });

  // New test case for keyboard handling
  it('should configure keyboard hotkeys', async () => {
    render(<VideoPlayer video={mockVideo} />);
    await screen.findByTestId('mock-videojs');

    const { videoJsOptions } = vi.mocked(VideoJS).mock.calls[0][0];
    expect(typeof videoJsOptions.userActions?.hotkeys).toBe('function');
  });

  it('should pass video source to VideoJS component', async () => {
    // Make test async
    render(<VideoPlayer video={mockVideo} />);

    await act(async () => {
      // Wrap in act for async operations
      await new Promise(resolve => setTimeout(resolve, 0)); // Let Suspense resolve
    });

    expect(VideoJS).toHaveBeenCalledWith(
      expect.objectContaining({
        video: mockVideo,
      }),
      expect.any(Object)
    );
  });
});

describe('VideoPlayer keyboard hotkeys', () => {
  let hotkeysFn;
  let playerMock;

  beforeEach(() => {
    // Render component to get the hotkeys function
    render(<VideoPlayer video={mockVideo} />);
    const { videoJsOptions } = vi.mocked(VideoJS).mock.calls[0][0];
    hotkeysFn = videoJsOptions.userActions.hotkeys;

    // Create mock player context
    playerMock = {
      play: vi.fn(),
      pause: vi.fn(),
      paused: vi.fn(),
      muted: vi.fn(),
      currentTime: vi.fn(),
      isFullscreen: vi.fn(),
      exitFullscreen: vi.fn(),
      requestFullscreen: vi.fn(),
    };
  });

  it('should toggle play/pause when K key is pressed', () => {
    // Mock KeyboardEvent
    const event = { which: 75, preventDefault: vi.fn() };

    // Test when player is paused
    playerMock.paused.mockReturnValue(true);
    hotkeysFn.call(playerMock, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(playerMock.play).toHaveBeenCalled();
    expect(playerMock.pause).not.toHaveBeenCalled();

    // Reset mocks
    vi.clearAllMocks();

    // Test when player is playing
    playerMock.paused.mockReturnValue(false);
    hotkeysFn.call(playerMock, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(playerMock.pause).toHaveBeenCalled();
    expect(playerMock.play).not.toHaveBeenCalled();
  });

  it('should toggle mute when M key is pressed', () => {
    const event = { which: 77, preventDefault: vi.fn() };

    // Test when player is unmuted
    playerMock.muted.mockReturnValue(false);
    hotkeysFn.call(playerMock, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(playerMock.muted).toHaveBeenCalledWith(true);

    // Reset mocks
    vi.clearAllMocks();

    // Test when player is muted
    playerMock.muted.mockReturnValue(true);
    hotkeysFn.call(playerMock, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(playerMock.muted).toHaveBeenCalledWith(false);
  });

  it('should seek backward when left arrow key is pressed', () => {
    const event = { which: 37, preventDefault: vi.fn() };

    playerMock.currentTime.mockReturnValue(10);
    hotkeysFn.call(playerMock, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(playerMock.currentTime).toHaveBeenCalledWith(5); // 10 - 5
  });

  it('should seek forward when right arrow key is pressed', () => {
    const event = { which: 39, preventDefault: vi.fn() };

    playerMock.currentTime.mockReturnValue(10);
    hotkeysFn.call(playerMock, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(playerMock.currentTime).toHaveBeenCalledWith(15); // 10 + 5
  });

  it('should toggle fullscreen when F key is pressed', () => {
    const event = { which: 70, preventDefault: vi.fn() };

    // Test when not in fullscreen
    playerMock.isFullscreen.mockReturnValue(false);
    hotkeysFn.call(playerMock, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(playerMock.requestFullscreen).toHaveBeenCalled();
    expect(playerMock.exitFullscreen).not.toHaveBeenCalled();

    // Reset mocks
    vi.clearAllMocks();

    // Test when in fullscreen
    playerMock.isFullscreen.mockReturnValue(true);
    hotkeysFn.call(playerMock, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(playerMock.exitFullscreen).toHaveBeenCalled();
    expect(playerMock.requestFullscreen).not.toHaveBeenCalled();
  });
});
