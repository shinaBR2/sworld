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
    // Make test async
    render(<VideoPlayer video={mockVideo} />);

    // Wait for Suspense to resolve
    const player = await screen.findByTestId('mock-videojs'); // Use findBy instead of getBy
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
          overrideNative: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
    });
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
