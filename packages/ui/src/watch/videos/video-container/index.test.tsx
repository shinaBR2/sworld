import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Auth, watchMutationHooks } from 'core';
import { VideoContainer } from './index';
import { VideoPlayer } from '../video-player';
import { AuthContextValue } from 'core/providers/auth';

// Mock dependencies
vi.mock('core', () => ({
  Auth: {
    useAuthContext: vi.fn(),
  },
  watchMutationHooks: {
    useVideoProgress: vi.fn(),
  },
}));

vi.mock('../video-player', () => ({
  VideoPlayer: vi.fn().mockReturnValue(<div data-testid="video-player" />),
}));

interface MockVideo {
  id: string;
  title: string;
  url: string;
}

describe('VideoContainer', () => {
  const mockVideo: MockVideo = {
    id: '123',
    title: 'Test Video',
    url: 'https://example.com/video.mp4',
  };
  const mockOnError = vi.fn();
  const mockGetAccessToken = vi.fn();
  const mockHandleProgress = vi.fn();
  const mockCleanup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockGetAccessToken.mockResolvedValue('mock-token');
    vi.mocked(Auth.useAuthContext).mockReturnValue({
      getAccessToken: mockGetAccessToken,
    } as unknown as AuthContextValue);
    vi.mocked(watchMutationHooks.useVideoProgress).mockReturnValue({
      handleProgress: mockHandleProgress,
      cleanup: mockCleanup,
    } as any);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render VideoPlayer with correct props', () => {
    render(<VideoContainer video={mockVideo} onError={mockOnError} />);

    expect(VideoPlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        video: mockVideo,
        onProgress: mockHandleProgress,
        onError: expect.any(Function),
      }),
      expect.any(Object)
    );
  });

  it('should initialize useVideoProgress hook with correct params', () => {
    render(<VideoContainer video={mockVideo} onError={mockOnError} />);

    expect(watchMutationHooks.useVideoProgress).toHaveBeenCalledWith({
      videoId: mockVideo.id,
      getAccessToken: mockGetAccessToken,
      onError: mockOnError,
    });
  });

  it('should call cleanup on unmount', () => {
    const { unmount } = render(<VideoContainer video={mockVideo} onError={mockOnError} />);

    unmount();
    expect(mockCleanup).toHaveBeenCalled();
  });

  it('should handle player errors correctly', () => {
    render(<VideoContainer video={mockVideo} onError={mockOnError} />);

    const mockError = new Error('Player error');
    const playerProps = vi.mocked(VideoPlayer).mock.calls[0][0];
    playerProps.onError(mockError);

    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it('should log player errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    render(<VideoContainer video={mockVideo} onError={mockOnError} />);

    const mockError = new Error('Player error');
    const playerProps = vi.mocked(VideoPlayer).mock.calls[0][0];
    playerProps.onError(mockError);

    expect(consoleSpy).toHaveBeenCalledWith('Player error:', mockError);
  });

  it('should call appropriate cleanup functions during lifecycle', () => {
    const { rerender } = render(<VideoContainer video={mockVideo} onError={mockOnError} />);

    // First cleanup should not be called yet
    expect(mockCleanup).not.toHaveBeenCalled();

    // Create new mock cleanup for second render
    const newMockCleanup = vi.fn();
    vi.mocked(watchMutationHooks.useVideoProgress).mockReturnValue({
      handleProgress: mockHandleProgress,
      cleanup: newMockCleanup,
    });

    // Rerender should trigger first cleanup
    rerender(<VideoContainer video={mockVideo} onError={mockOnError} />);
    expect(mockCleanup).toHaveBeenCalledTimes(1);
    expect(newMockCleanup).not.toHaveBeenCalled();

    // Unmounting should trigger latest cleanup
    rerender(<></>);
    expect(newMockCleanup).toHaveBeenCalledTimes(1);
  });
});
