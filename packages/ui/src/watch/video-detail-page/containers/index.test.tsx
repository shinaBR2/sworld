// src/components/video-detail-page/containers/index.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoDetailContainer } from './index';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { VideoDetailContainerProps } from './types';

type MockVideo = {
  id: string;
  type: 'video';
  title: string;
  description: string;
  thumbnailUrl: string;
  source: string;
  slug: string;
  duration: number;
  createdAt: string;
  user: { username: string };
  lastWatchedAt: string | null;
  progressSeconds: number;
  subtitles: Array<{ id: string; lang: string; src: string; isDefault: boolean; label: string }>;
};

// Mock dependencies
vi.mock('./skeleton', () => ({
  MainContentSkeleton: () => <div data-testid="main-content-skeleton" />,
  RelatedContentSkeleton: () => <div data-testid="related-content-skeleton" />,
}));

vi.mock('@mui/material/FormControlLabel', () => ({
  default: ({ control, label }: { control: React.ReactNode; label: React.ReactNode }) => (
    <div data-testid="form-control-label">
      {control}
      <span>{label}</span>
    </div>
  ),
}));

vi.mock('@mui/material/Checkbox', () => ({
  default: ({
    checked,
    onChange,
  }: {
    checked?: boolean;
    onChange: (event: { target: { checked: boolean } }) => void;
  }) => (
    <input
      type="checkbox"
      data-testid="auto-play-checkbox"
      checked={checked}
      onChange={e => onChange({ target: { checked: e.target.checked } })}
    />
  ),
}));

// Create VideoContainer mock with a mock implementation
const mockVideoContainer = vi.fn().mockImplementation(({ video, onEnded }) => (
  <div data-testid="video-container" onClick={() => onEnded?.()}>
    {video.title}
  </div>
));

// Mock the VideoContainer module
vi.mock('../../videos/video-container', () => ({
  VideoContainer: (props: { video: MockVideo; onEnded?: () => void; onError?: (error: unknown) => void }) =>
    mockVideoContainer(props),
}));

vi.mock('../../dialogs/share', () => ({
  ShareDialog: ({
    open,
    onClose,
    onShare,
  }: {
    open: boolean;
    onClose: () => void;
    onShare: (emails: string[]) => void;
  }) => (
    <div data-testid="share-dialog" style={{ display: open ? 'block' : 'none' }}>
      <button onClick={() => onShare(['test@example.com'])}>Share</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../related-list', () => ({
  RelatedList: ({
    title,
    videos,
    autoPlay,
    onAutoPlayChange,
  }: {
    title: string;
    videos: MockVideo[];
    autoPlay?: boolean;
    onAutoPlayChange?: (checked: boolean) => void;
  }) => (
    <div data-testid="related-list">
      <div data-testid="related-list-title">{title}</div>
      <div data-testid="related-list-count">{videos.length}</div>
      {onAutoPlayChange && (
        <input
          type="checkbox"
          data-testid="related-list-autoplay"
          checked={autoPlay}
          onChange={e => onAutoPlayChange(e.target.checked)}
        />
      )}
    </div>
  ),
}));

vi.mock('./styled', () => ({
  StyledRelatedContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="styled-related-container">{children}</div>
  ),
}));

const mockLinkComponent = ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>;

const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('VideoDetailContainer', () => {
  const mockVideos: MockVideo[] = [
    {
      id: 'video1',
      type: 'video',
      title: 'Video 1',
      description: 'Test video 1',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      source: 'https://example.com/video1',
      slug: 'video-1',
      duration: 120,
      createdAt: '2023-01-01',
      user: { username: 'testuser' },
      lastWatchedAt: null,
      progressSeconds: 0,
      subtitles: [{ id: '1', lang: 'en', src: 'https://example.com/sub1.vtt', isDefault: true, label: 'English' }],
    },
    {
      id: 'video2',
      type: 'video',
      title: 'Video 2',
      description: 'Test video 2',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      source: 'https://example.com/video2',
      slug: 'video-2',
      duration: 180,
      createdAt: '2023-01-02',
      user: { username: 'testuser' },
      lastWatchedAt: null,
      progressSeconds: 0,
      subtitles: [{ id: '1', lang: 'en', src: 'https://example.com/sub1.vtt', isDefault: true, label: 'English' }],
    },
    {
      id: 'video3',
      type: 'video',
      title: 'Video 3',
      description: 'Test video 3',
      thumbnailUrl: 'https://example.com/thumb3.jpg',
      source: 'https://example.com/video3',
      slug: 'video-3',
      duration: 240,
      createdAt: '2023-01-03',
      user: { username: 'testuser' },
      lastWatchedAt: null,
      progressSeconds: 0,
      subtitles: [{ id: '1', lang: 'en', src: 'https://example.com/sub1.vtt', isDefault: true, label: 'English' }],
    },
  ];

  const defaultProps: VideoDetailContainerProps = {
    activeVideoId: 'video1',
    queryRs: {
      isLoading: false,
      error: null,
      videos: mockVideos,
      playlist: null,
    },
    LinkComponent: mockLinkComponent,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockVideoContainer.mockImplementation(({ video, onEnded }) => (
      <div data-testid="video-container" onClick={() => onEnded?.()}>
        {video.title}
      </div>
    ));
  });

  it('should render loading skeletons when isLoading is true', async () => {
    const loadingProps = {
      ...defaultProps,
      queryRs: {
        ...defaultProps.queryRs,
        isLoading: true,
      },
    };

    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...loadingProps} />);
    });

    expect(screen.getByTestId('main-content-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('related-content-skeleton')).toBeInTheDocument();
  });

  it('should render video content and related list when data is loaded', async () => {
    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...defaultProps} />);
    });

    // Main content checks
    expect(screen.getByTestId('video-container')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Video 1');
    expect(screen.getByTestId('video-container')).toHaveTextContent('Video 1');

    // Share button should not be present by default
    expect(screen.queryByTitle('Share video')).not.toBeInTheDocument();

    // Related content checks
    expect(screen.getByTestId('related-list')).toBeInTheDocument();
    expect(screen.getByTestId('related-list-title')).toHaveTextContent('Other videos');
    expect(screen.getByTestId('related-list-count')).toHaveTextContent('3');
  });

  it('should display "Same playlist" when playlist is provided', async () => {
    const playlistProps: VideoDetailContainerProps = {
      ...defaultProps,
      queryRs: {
        ...defaultProps.queryRs,
        playlist: {
          __typename: 'playlist',
          id: 'playlist1',
          title: 'My Playlist',
          slug: 'my-playlist',
          createdAt: '2023-01-01',
          user: { __typename: 'users' },
          playlist_videos: [],
          thumbnailUrl: 'https://example.com/playlist.jpg',
          description: 'Test playlist',
        },
      },
    };

    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...playlistProps} />);
    });

    expect(screen.getByTestId('related-list-title')).toHaveTextContent('Same playlist');
  });

  it('should return null in MainContent when video is not found', async () => {
    const noVideoProps = {
      ...defaultProps,
      activeVideoId: 'nonexistent',
    };

    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...noVideoProps} />);
    });

    // The component should return null for the main content
    expect(screen.queryByTestId('video-container')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('should return null in RelatedContent when video is not found', async () => {
    const noVideoProps = {
      ...defaultProps,
      activeVideoId: 'nonexistent',
    };

    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...noVideoProps} />);
    });

    // The component should return null for the related content
    expect(screen.queryByTestId('related-list')).not.toBeInTheDocument();
  });

  it('should handle onError in VideoContainer', async () => {
    // Create a spy on console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Update the mockVideoContainer implementation to simulate an error
    mockVideoContainer.mockImplementation(({ onError }) => {
      // Simulate an error
      onError(new Error('Test error'));
      return <div data-testid="video-container">Video with error</div>;
    });

    renderWithTheme(<VideoDetailContainer {...defaultProps} />);

    // Verify the error handler was called
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    // Clean up
    consoleSpy.mockRestore();
  });

  it('should handle video end and auto-play next video', async () => {
    const onVideoEnded = vi.fn();
    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...defaultProps} onVideoEnded={onVideoEnded} />);
    });

    // Simulate video end
    screen.getByTestId('video-container').click();

    // Check if onVideoEnded was called with the next video
    expect(onVideoEnded).toHaveBeenCalledWith(mockVideos[1]);
  });

  it('should handle auto-play toggle', async () => {
    const onVideoEnded = vi.fn();
    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...defaultProps} onVideoEnded={onVideoEnded} />);
    });

    // Auto-play should be enabled by default
    const checkbox = screen.getByTestId('related-list-autoplay');
    expect(checkbox).toBeChecked();

    // Toggle auto-play off
    await act(async () => {
      fireEvent.click(checkbox);
    });

    // Auto-play should now be disabled
    expect(checkbox).not.toBeChecked();

    // Trigger video end to test auto-play behavior
    const videoContainer = screen.getByTestId('video-container');
    await act(async () => {
      fireEvent.click(videoContainer);
    });

    // Should not auto-play next video since autoplay is off
    expect(onVideoEnded).not.toHaveBeenCalled();
  });

  describe('share functionality', () => {
    it('should not show share button when onShare prop is not provided', async () => {
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...defaultProps} />);
      });
      expect(screen.queryByLabelText('Share video')).not.toBeInTheDocument();
    });

    it('should show share button when onShare prop is provided', async () => {
      const onShare = vi.fn();
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...defaultProps} onShare={onShare} />);
      });
      expect(screen.getByLabelText('Share video')).toBeInTheDocument();
    });

    it('should open share dialog when share button is clicked', async () => {
      const onShare = vi.fn();
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...defaultProps} onShare={onShare} />);
      });

      const shareButton = screen.getByLabelText('Share video');
      await act(async () => {
        fireEvent.click(shareButton);
      });

      const shareDialog = screen.getByTestId('share-dialog');
      expect(shareDialog).toHaveStyle({ display: 'block' });
    });

    it('should close share dialog when close button is clicked', async () => {
      const onShare = vi.fn();
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...defaultProps} onShare={onShare} />);
      });

      // Open dialog
      const shareButton = screen.getByLabelText('Share video');
      await act(async () => {
        fireEvent.click(shareButton);
      });

      // Close dialog
      const closeButton = screen.getByText('Close');
      await act(async () => {
        fireEvent.click(closeButton);
      });

      const shareDialog = screen.getByTestId('share-dialog');
      expect(shareDialog).toHaveStyle({ display: 'none' });
    });

    it('should call onShare callback with emails when share is confirmed', async () => {
      const onShare = vi.fn();
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...defaultProps} onShare={onShare} />);
      });

      // Open dialog
      const shareButton = screen.getByLabelText('Share video');
      await act(async () => {
        fireEvent.click(shareButton);
      });

      // Click share button in dialog
      const dialogShareButton = screen.getByText('Share');
      await act(async () => {
        fireEvent.click(dialogShareButton);
      });

      expect(onShare).toHaveBeenCalledWith(['test@example.com']);
    });
  });
});
